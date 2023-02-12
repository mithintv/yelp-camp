if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const { domain } = require('./src/constants');

// Initializing Express and path
const express = require('express');
const path = require('path');
const router = express.Router();

// ODM package to interact with MongoDB
const mongoose = require('mongoose');

// EJS Templating and helpers
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

// Error handling custom modules from utils
const ExpressError = require("./src/utils/ExpressError");

// Package to prevent mongo injections
const mongoSanitize = require('express-mongo-sanitize');

// Requiring routes
const campgroundRoutes = require("./src/routes/campgrounds");
const reviewRoutes = require("./src/routes/reviews");
const userRoutes = require("./src/routes/users");

// Initializing Express Sessions with Mongo
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Initializing Flash for flashing temporary messages
const flash = require("connect-flash");

// Authentication npm package initialization and importing User mongoose model
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./src/models/user");

// Express.js security with HTTP headers
const helmet = require("helmet");

// Connecting to MongoDB via Mongoose ODM
let dbUrl = process.env.DB_URL;
if (process.env.NODE_ENV !== "production") {
    dbUrl = 'mongodb://localhost:27017/yelp-camp';
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};


// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });


// Express specific options and settings
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "src/public")));
app.use(mongoSanitize());


// Using Express Sessions
const sessionConfig = {
    name: "yelp-camp-session",
    secret: process.env.EXPRESS_SESSION_SECRET,
    store: MongoStore.create({
        mongoUrl: dbUrl,
        secret: process.env.EXPRESS_SESSION_SECRET,
        touchAfter: 24 * 3600
    }).on("error", (e) => {
        console.log("SESSION STORE ERROR", e);
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

// Configuring Flash
app.use(flash());

// Configuring Helmet
app.use(helmet({ crossOriginEmbedderPolicy: false }));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlhdt6yrw/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// Configuring Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Passing in global variables for access in all templates like flash messages for routes if they exist
app.use((req, res, next) => {
    if (![`${domain}/login`, domain].includes(req.originalUrl)) {
        req.session.reqUrl = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Using routes
app.use(`${domain}/campgrounds`, campgroundRoutes);
app.use(`${domain}/campgrounds/:id/reviews`, reviewRoutes);
app.use(domain, userRoutes);
app.use(domain, router);

// All other routes
router.get('/', (req, res) => {
    res.render('home');
});

router.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Error handler route
router.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no! Something went wrong!";
    res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
});
