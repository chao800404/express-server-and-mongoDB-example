const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('../models/userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxLength: [40, 'The name must be at least 40 characters'],
      minLength: [10, 'The name must be at above 10 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duraction']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty option'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'The difficulty option is either easy, medium , difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must be below 5.0'],
      min: [1, 'Rating must be above 1.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have description']
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image']
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: Boolean,
    start: Date,
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// ??????create ??????save???????????????????????????
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true, trim: true });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const promiseGuides = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(promiseGuides);

//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// query ????????? ????????????????????? ????????????????????????
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function() {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(this.pipeline());
//   next();
// });

//???????????????database???????????????object????????????
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// ???????????????????????????review ???tour?????????????????????????????????
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // ?????? Review ??????tour?????????
  localField: '_id' // ????????? ?????????id
});

module.exports = mongoose.model('Tour', tourSchema);
