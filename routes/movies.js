const express = require("express");
const { Genre } = require("../models/genre");
const router = express.Router();
const { Movie, validate } = require("../models/movie");
const auth = require("../middleware/auth");

async function getMovies() {
  return await Movie.find().sort("title");
}

async function findByIdIn(ids) {
  return await Movie.find({
    _id: {
      $in: ids,
    },
  }).select();
}

async function createMovie(movie) {
  var theGenre = await genres.database.getById(movie.genreId);

  if (!theGenre) {
    throw new Error("Invalid genre");
  }

  return await new Movie({
    title: movie.title,
    genre: {
      _id: theGenre._id,
      name: theGenre.name,
    },
    numberInStock: movie.numberInStock,
    dailyRentalRate: movie.dailyRentalRate,
  }).save();
}

async function updateMovie(id, updateObject) {
  var theGenre = await genres.database.getById(updateObject.genreId);

  if (!theGenre) {
    throw new Error("Invalid genre");
  }

  return await Movie.findByIdAndUpdate(
    id,
    {
      $set: {
        title: updateObject.title,
        genre: {
          _id: theGenre._id,
          name: theGenre.name,
        },
        numberInStock: updateObject.numberInStock,
        dailyRentalRate: updateObject.dailyRentalRate,
      },
    },
    { new: true }
  );
}

router.get("/", async (req, res) => {
  getMovies()
    .then((Movie) => res.send(Movie))
    .catch((err) =>
      logServerErrorAndRespond(err, `Could not get all Movies`, res)
    );
});

router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie)
      return res
        .status(404)
        .send(`A movie with id ${req.params.id} was not found!`);
    res.send(movie);
  } catch (ex) {
    logServerErrorAndRespond(
      err,
      `Error fetching movie with id: ${req.params.id}`,
      res
    );
  }
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    dailyRentalRate: req.body.dailyRentalRate,
    numberInStock: req.body.numberInStock,
  });
  await movie.save();

  res.send(movie);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  let movie = {
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    dailyRentalRate: req.body.dailyRentalRate,
    numberInStock: req.body.numberInStock,
  };

  movie = await Movie.findByIdAndUpdate(req.params.id, movie, {
    new: true,
  });

  if (!movie) return res.status(404).send("movie with given id was not found");

  res.send(movie);
});

router.delete("/:id", auth, async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);
  if (!movie) return res.status(404).send("movie with given id was not found");

  res.send(movie);
});

module.exports = router;
