// Initializing Express and Express Router
const express = require("express");
const router = express.Router();

// Custom modules for schemas via mongoose
const Campground = require('../models/campground');

// Error handling custom modules from utils
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

// NPM package to validate data before mongoose/mongo interaction in case client-side validation is bypassed. Essentially server side validation that is scalable 
const { campgroundJoiSchema } = require("../validation/schemas");

const validateCampground = (req, res, next) => {
  const { error } = campgroundJoiSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else next(); // required so that if validated, the next route handler is called
};

router.get('/', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', (req, res) => {
  res.render('campgrounds/new');
});

router.post('/', validateCampground, catchAsync(async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  req.flash("success", "Succesfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id', catchAsync(async (req, res,) => {
  const campground = await Campground.findById(req.params.id).populate("reviews");
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect('/campgrounds');
}));

module.exports = router;