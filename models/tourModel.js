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
      min: [1, 'Rating must be above 1.0']
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

// 只有create 以及save時這中間件才會運作
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

// query 中間件 可以拿來過濾掉 不想給客戶看到的
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

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

//不會儲存至database中，虛擬的object元素列出
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// 因為不想儲存龐大的review 進tour，所以用虛擬生成的方式
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // 對象 Review 中的tour做連接
  localField: '_id' // 對映值 本端的id
});

module.exports = mongoose.model('Tour', tourSchema);
