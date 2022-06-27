const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const handleFactory = require('./handleFactory');

exports.updateMe = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, name, email } = req.body;
  if (password || passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  try {
    const { id } = req.user;
    await User.findByIdAndUpdate(id, { active: false });
  } catch (error) {
    console.log(error);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: 'Fail',
    message: 'This route is not defined! Please use /signup instead'
  });
};

exports.getAllUser = handleFactory.getAll(User);
exports.getUser = handleFactory.getOne(User);

// 此處不能用於修改密碼
exports.updateUser = handleFactory.updateOne(User);
exports.deleteUser = handleFactory.deleteOne(User);
