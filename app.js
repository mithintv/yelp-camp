require("dotenv").config();

// Initializing Express and path
const express = require('express');
const path = require('path');

// ODM package to interact with MongoDB
const mongoose = require('mongoose');

// EJS Templating and helpers
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

// Error handling custom modules from utils
const ExpressError = require("./utils/ExpressError");

// Requiring routes
const campgrounds = require("./routes/campground");
const reviews = require("./routes/reviews");

// Initializing Express Sessions
const session = require("express-session");

// Initializing Flash for flashing temporary messages
const flash = require("connect-flash");

// Connecting to MongoDB via Mongoose ODM
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


// Express specific options and settings
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));

// Using Express Sessions
const sessionConfig = {
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

// Configuring Flash
app.use(flash());

// Passing in flash messages for all routes if they exist
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Using routes
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);


// All other routes
app.get('/', (req, res) => {
    res.render('home');
});

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Error handler route
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no! Something went wrong!";
    res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});