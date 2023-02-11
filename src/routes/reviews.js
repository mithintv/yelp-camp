// Initializing Express and Express Router
const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams needs to be true to access campgrounds/:id route defined in app.js 

// Error handling custom modules from utils
const catchAsync = require("../utils/catchAsync");

// Controller functions
const reviews = require("../controllers/reviews");

// Importing middleware functions
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware");


router.post("/", isLoggedIn, validateReview, catchAsync(reviews.create));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.delete));

module.exports = router;