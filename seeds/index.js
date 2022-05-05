const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
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
                    url: 'https://res.cloudinary.com/dlhdt6yrw/image/upload/v1651511548/YelpCamp/zircrxaiikkt9tewu74y.jpg',
                    filename: 'YelpCamp/zircrxaiikkt9tewu74y'
                },
                {
                    url: 'https://res.cloudinary.com/dlhdt6yrw/image/upload/v1651513512/YelpCamp/ih3isjcr0tdpj7vpdbf1.jpg',
                    filename: 'YelpCamp/ih3isjcr0tdpj7vpdbf1'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price: price,
            author: "626a97326f88534e0800625d"
        });
        await camp.save();
    }
    console.log("Succesfully re-seeded database");
};

seedDB().then(() => {
    mongoose.connection.close();
    console.log("Closed mongoose connection to database");
});