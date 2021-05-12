// NPM package to validate data before mongoose/mongo interaction in case client-side validation is bypassed. Essentially server side validation that is scalable 
const Joi = require("joi");

module.exports.campgroundJoiSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required()
  }).required()
});


