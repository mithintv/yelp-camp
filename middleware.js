// Custom modules for schemas via mongoose
const Campground = require('./models/campground');

// NPM package to validate data before mongoose/mongo interaction in case client-side validation is bypassed. Essentially server side validation that is scalable 
const { campgroundJoiSchema, reviewJoiSchema } = require("./validation/schemas");

// Error handling custom modules from utils
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  };
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You are not authorized");
    return res.redirect(`/campgrounds/${req.params.id}`);
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundJoiSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else next(); // required so that if validated, the next route handler is called
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewJoiSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else next(); // required so that if validated, the next route handler is called
};