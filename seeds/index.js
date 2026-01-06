
const mongoose = require('mongoose');
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for(let i = 0; i < 50; i++){
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '68ed97b11c04ca5e4d95c776',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      price: price,
      images: [
        {
          url: 'https://res.cloudinary.com/dg8nd8evh/image/upload/v1767662547/YelpCamp/fit9ndzpwr4wadqmyego.jpg',
          filename: 'YelpCamp/fit9ndzpwr4wadqmyego',
        },
        {
          url: 'https://res.cloudinary.com/dg8nd8evh/image/upload/v1767662548/YelpCamp/xpu9sfhy6rbvphr9tlkq.webp',
          filename: 'YelpCamp/xpu9sfhy6rbvphr9tlkq',
        }
      ]
    })
    await camp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close()
})
