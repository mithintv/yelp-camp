// Initializing Express and Express Router
const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams needs to be true to access campgrounds/:id route defined in app.js

// Custom modules for schemas via mongoose
const Campground = require('../models/campground');
const Review = require('../models/review');

// Error handling custom modules from utils
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

// NPM package to validate data before mongoose/mongo interaction in case client-side validation is bypassed. Essentially server side validation that is scalable 
const { reviewJoiSchema } = require("../validation/schemas");

const validateReview = (req, res, next) => {
  const { error } = reviewJoiSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else next(); // required so that if validated, the next route handler is called
};

router.post("/", validateReview, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Successfully added review!");
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:reviewId", catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id,
    {
      $pull: {
        reviews: reviewId
      }
    });
  await Review.findByIdAndDelete(req.params.reviewId);
  req.flash("success", "Successfully deleted review!");
  res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;