const mongoose = require("mongoose");
const Joi = require("joi");
const { genreSchema } = require("./genre");

const Movie = mongoose.model(
  "Movie",
  new mongoose.Schema({
    title: { type: String, required: true, trim:true, minlength: 3, maxlength: 50 },
    genre: { type: genreSchema, required: true },
    numberInStock: { type: Number, required: true, min: 0 },
    dailyRentalRate: { type: Number, required: true, min: 0 },
  })
);

function validateMovie(movie) {
  const schema = {
    title: Joi.string().min(3).max(50).required(),
    numberInStock: Joi.number().integer().required(),
    dailyRentalRate: Joi.number().integer().required(),
    genreId: Joi.objectId().required()
  };

  return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validate = validateMovie;
