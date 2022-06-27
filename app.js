const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalHandleError = require('./controller/errorController');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('tiny'));
}

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standarHeaders: true,
  message:
    'Too many accounts created from this IP, please try again after an hour'
});

// 防止noSQL qurey 攻擊
app.use(mongoSanitize());
// 防止被插入帶有JS的HTML片段
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'ducation',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use('/api', limiter);

// 帶有更多安全性設定headers
app.use(helmet());

app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Cant't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';

  next(new AppError(`Cant't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalHandleError);

module.exports = app;
