const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkBody = (req, res, next) => {
  const { price, name } = req.body;

  if (!price || !name) {
    return res.status(400).json({
      status: 'fail',
      message: 'The name and price is necessary'
    });
  }

  next();
};

exports.checkTourId = (req, res, next, id) => {
  const tour = tours.find(el => el.id === +id);

  if (!tour) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid Id'
    });
  }

  next();
};

exports.getAlltour = (req, res) => {
  res.status(200).json({
    status: 'success',
    result: tours.length,
    requestAt: req.requestTime,
    data: {
      tours
    }
  });
};

exports.getTour = (req, res) => {
  const { id } = req.params;

  const tour = tours.find(el => el.id === +id);

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.updateTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: '<Update data in here...>'
  });
};

exports.createTour = (req, res) => {
  //   console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { ...req.body, id: newId };
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      if (err) return console.log(err);
      res.status(201).json({
        status: 'success',
        result: tours.length,
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
