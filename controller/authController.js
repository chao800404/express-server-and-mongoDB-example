const jwt = require('jsonwebtoken');
const Email = require('../utils/email');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const cookie = require('cookie');

const MAX_AGE = 30 * 24 * 60 * 60;

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.EXPIRESIN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const setCookie = cookie.serialize('JWT', token, {
    httpOnly: true,
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  });

  user.password = undefined;

  res.setHeader('Set-Cookie', setCookie);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangeAt } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangeAt
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();
  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = async (req, res) => {
  const setCookie = cookie.serialize('JWT', '', {
    httpOnly: true,
    maxAge: -1,
    path: '/'
  });

  res.setHeader('Set-Cookie', setCookie);
  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization
    ? authorization.token.split(' ')[1]
    : req.cookies.JWT;

  if (!token) {
    return next(new AppError('You are not logged in! Please log in', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  const token = req.cookies.JWT;

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser || currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }
    res.locals.user = currentUser;
  }

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    const isManagers = roles.includes(req.user.role);

    if (!isManagers) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    return next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('There is not user with email address', 404));
  }

  const resetToken = user.createPasswordResetToken();
  // 不進行驗證 validateBeforeSave
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token send to email'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(error);

    return next(
      new AppError(
        'There was an error sending the email. Please try again later'
      ),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired'), 400);
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const user = await User.findById(id).select('+password');

  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Your current password is wrong', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // 確保所有有關密碼類的都用save，因為update類型不會再次執行驗證
  await user.save();
  createSendToken(user, 200, res);
});
