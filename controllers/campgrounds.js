// Custom modules for schemas via mongoose
const Campground = require('../models/campground');

// Importing cloudinary access for image upload and deletion
const { cloudinary } = require("../cloudinary");

// Importing mapbox access for geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_PUBLIC_TOKEN });

// Index Route
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

// New Route
module.exports.new = (req, res) => {
    res.render('campgrounds/new');
};

// Create Route
module.exports.create = async (req, res) => {
    const geoData = await geocodingClient.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(file => ({
        url: file.path,
        filename: file.filename
    }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash("success", "Succesfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

// Show Route
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

// Edit Route
module.exports.edit = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit', { campground });
};

// Update Route
module.exports.update = async (req, res) => {
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    const addImageArray = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.images.push(...addImageArray);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

// Delete Route
module.exports.delete = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect('/campgrounds');
};