const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url: String,
    filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200/h_100");
});

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
},
    {
        toJSON: { virtuals: true } // required to include virtuals when converting a document into JSON or geoJSON 
    });


campgroundSchema.virtual("properties.popupHtml").get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a><br><p>${this.location}</p>`;
});

campgroundSchema.post("findOneAndDelete", async (doc) => {
    if (doc) {
        await Review.deleteMany({
            _id:
            {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Campground', campgroundSchema);
