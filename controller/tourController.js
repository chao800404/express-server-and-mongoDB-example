const Tour = require('../models/tourModel');

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getAlltour = async (req, res) => {
  try {
    const { page, sort, limit, fields, ...rest } = req.query;
    let queryStr = JSON.stringify(rest);

    //大於小於搜尋
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    queryStr = JSON.parse(queryStr);

    let query = Tour.find(queryStr);

    //排序搜尋
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createAt');
    }

    // 部分搜尋
    if (fields) {
      const fieldsContent = fields.split(',').join(' ');
      query = query.select(fieldsContent);
    } else {
      query = query.select('-__v');
    }

    // 頁碼 數量搜尋
    const curPage = page * 1 || 1;
    const curLimit = limit * 1 || 100;
    const skip = (curPage - 1) * curLimit;

    if (page) {
      const numTours = await Tour.countDocuments();

      if (skip > numTours) {
        res.status(403).json({
          status: 'fail',
          message: 'This page is not exist'
        });
      }
    }
    query = query.skip(skip).limit(curLimit);
    const tours = await query;

    // 送出
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.statu(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.statu(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;

    const updateTour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidation: true
    });

    res.status(201).json({
      status: 'success',
      data: {
        updateTour
      }
    });
  } catch (err) {
    res.statu(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  const { id } = req.params;

  try {
    const tour = await Tour.findByIdAndDelete(id, {
      strict: true
    });
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.statu(404).json({
      status: 'fail',
      message: err
    });
  }
};
