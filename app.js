const express = require('express');

const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalHandleError = require('./controller/errorController');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('tiny'));
}

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Cant't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';

  next(new AppError(`Cant't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalHandleError);

module.exports = app;
