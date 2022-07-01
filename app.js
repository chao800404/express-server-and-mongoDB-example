const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalHandleError = require('./controller/errorController');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');

const cookieParser = require('cookie-parser');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

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

app.use(cors());
app.options('*', cors());

// 也能夠設置特定路線
// app.options('/api/v1/tours/:id', cors());

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
app.use(cookieParser());

const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://*.stripe.com/',
  'https://js.stripe.com/',
  'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/'
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
  'https://bundle.js:*'
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// 帶有更多安全性設定headers
// app.use(
//   helmet({
//     allowFrom: '*',
//     crossOriginResourcePolicy: false,
//     crossOriginEmbedderPolicy: false,
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: [],
//         connectSrc: ["'self'", ...connectSrcUrls],
//         scriptSrc: ["'self'", ...scriptSrcUrls],
//         styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//         workerSrc: ["'self'", 'blob:'],
//         frameSrc: ["'self'", 'https://*.stripe.com'],
//         objectSrc: [],
//         imgSrc: ["'self'", 'blob:', 'data:'],
//         fontSrc: ["'self'", ...fontSrcUrls]
//       }
//     }
//   })
// );

app.use(helmet());

app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  // console.log(req.cookies);
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.all('*', (req, res, next) => {
  // const err = new Error(`Cant't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';

  next(new AppError(`Cant't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalHandleError);

module.exports = app;
