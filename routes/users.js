// Initializing Express and Express Router
const express = require("express");
const router = express.Router();

// Initializing passport
const passport = require("passport");

// Error handling custom modules from utils
const catchAsync = require("../utils/catchAsync");

// Controller functions
const users = require("../controllers/users");

// All user routes
router.route("/register")
  .get(users.renderRegisterForm)
  .post(catchAsync(users.register));

router.route("/login")
  .get(users.renderLoginForm)
  .post(passport.authenticate("local",
    {
      failureFlash: true,
      failureRedirect: "/login"
    }),
    users.login);


router.get("/logout", users.logout);

module.exports = router;