// Custom modules for schemas via mongoose
const User = require("../models/user");

const { domain } = require('../constants');

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to Yelp Camp");
            res.redirect(`${domain}/campgrounds`);
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect(`${domain}/register`);
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome Back!");
    const requestedUrl = req.session.reqUrl;
    delete req.session.reqUrl;
    res.redirect(requestedUrl || `${domain}/campgrounds`); // redirecting to URL that was requested prior to being asked to login or default
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect(`${domain}/campgrounds`);
};
