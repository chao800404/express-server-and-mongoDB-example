const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const { path, value } = err;
  return new AppError(`Invalid ${path} : ${value}`, 400);
};

const handleJWTError = () => {
  return new AppError(`Invalid token. Please log in again`, 401);
};

const handleJWTExpiredError = () => {
  return new AppError(`Your token has expired! Please log in again.`, 401);
};

const handleValidatorError = err => {
  const errors = Object.values(err.errors).map(error => error.message);
  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleDuplicateError = err => {
  const { keyValue } = err;
  const message = `Duplicate field value: ${keyValue.name} Please use another value`;
  return new AppError(message, 400);
};

const sendErrorDev = (req, res, err) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }

  res.status(err.statusCode).render('error', {
    title: 'Somthing went wrong',
    msg: err.message
  });
};

const sendErrorProd = (req, res, err) => {
  if (req.originalUrl.startsWith('/api')) {
    console.log(err);
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      res.status(500).json({
        status: 'Error',
        message: 'Something went wrong'
      });
    }
  }

  res.status(err.statusCode).render('error', {
    title: 'Somthing went wrong',
    msg: err.message
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(req, res, err);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(error);
    if (err.code === 11000) err = handleDuplicateError(error);
    if (err.name === 'ValidationError') err = handleValidatorError(error);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

    return sendErrorProd(req, res, err);
  }
};
