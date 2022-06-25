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

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorProd = (res, err) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // console.error('ERROR', err);

    res.status(500).json({
      status: 'Error',
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err };

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateError(error);
    if (err.name === 'ValidationError') error = handleValidatorError(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(res, error);
  }
};
