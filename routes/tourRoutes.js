const express = require('express');
const tourController = require('../controller/tourController');

const router = express.Router();

router.param('id', tourController.checkTourId);

router
  .route('/')
  .get(tourController.getAlltour)
  .post(tourController.checkBody, tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
