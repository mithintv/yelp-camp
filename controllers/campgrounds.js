// Custom modules for schemas via mongoose
const Campground = require('../models/campground');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.new = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.create = async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Succesfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.show = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate("author").populate({
        path: "reviews",
        populate: {
            path: 'author'
        }
    });
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/show', { campground });
};

module.exports.edit = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.update = async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.delete = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect('/campgrounds');
};