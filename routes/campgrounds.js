// Initializing Express and Express Router
const express = require("express");
const router = express.Router();

// Custom modules for schemas via mongoose
const Campground = require('../models/campground');

// Error handling custom modules from utils
const catchAsync = require("../utils/catchAsync");

// Importing middleware functions
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");



router.get('/', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

router.post('/',
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Succesfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  }));

router.get('/:id', catchAsync(async (req, res,) => {
  const campground = await Campground.findById(req.params.id).populate("author").populate("reviews");
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
  const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect('/campgrounds');
}));

module.exports = router;