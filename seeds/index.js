const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors, images } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const img1 = sample(images);
        const img2 = sample(images);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: img1,
                    filename: img1.slice(63, img1.length)
                },
                {
                    url: img2,
                    filename: img2.slice(63, img1.length)
                },
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price: price,
            author: "63e6f2038174fb7670ed2138"
        });
        await camp.save();
    }
    console.log("Succesfully re-seeded database");
};

seedDB().then(() => {
    mongoose.connection.close();
    console.log("Closed mongoose connection to database");
});
