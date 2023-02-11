

// Initializing Express and Express Router
const express = require("express");
const router = express.Router();

// Error handling custom modules from utils
const catchAsync = require("../utils/catchAsync");

// Controller functions
const campgrounds = require("../controllers/campgrounds");

// Importing middleware functions
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

// Importing cloudinary storage configuration
const { storage } = require("../cloudinary");

// Importing and initializing multer which parses form data for enctype="multipart/form-data"
const multer = require("multer");
const upload = multer({ storage });

// All campground routes
router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.create));


router.route("/new")
    .get(isLoggedIn, campgrounds.new);

router.route("/:id")
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.update))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.edit));

module.exports = router;
