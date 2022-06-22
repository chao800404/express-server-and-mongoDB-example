const express = require('express');
const tourController = require('../controller/tourController');

const router = express.Router();

router
  .route('/')
  .get(tourController.getAlltour)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
