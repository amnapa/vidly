const express = require("express");
const router = express.Router();
const { Rental, validate } = require("../models/rental");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const auth = require("../middleware/auth");


Fawn.init("mongodb://127.0.0.1/vidly");

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.get("/:id", async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental)
    return res.status(404).send("rental with given id was not found");

  res.send(rental);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(404).send("Invalid customer");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(404).send("Invalid movie");

  if (movie.numberInStock === 0)
    return res.status(404).send("Movie not in stock.");

  let rental = new Rental({
    customer: {
      _Id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  try {
    new Fawn.Task()
      .save("rentals", rental)
      .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
      .run();

    res.send(rental);
  } catch (ex) {
    return res.status(500).send("Something failed.");
  }
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let rental = {
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  };

  rental = await Rental.findByIdAndUpdate(req.params.id, rental, {
    new: true,
  });

  if (!rental)
    return res.status(404).send("rental with given id was not found");

  res.send(rental);
});

router.delete("/:id", auth, async (req, res) => {
  const rental = await Rental.findByIdAndRemove(req.params.id);
  if (!rental)
    return res.status(404).send("rental with given id was not found");

  res.send(rental);
});

module.exports = router;
