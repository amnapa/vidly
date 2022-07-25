const { Rental } = require("../../models/rental");
const { Movie } = require("../../models/movie");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
const moment = require("moment");
const request = require("supertest");

describe("", () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let token;
  let movie;

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    server = require("../../index");

    token = new User().generateAuthToken();
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    rental = new Rental({
      customer: {
        _id: customerId,
        name: "abcde",
        phone: "12345",
      },
      movie: {
        _id: movieId,
        title: "abcde",
        dailyRentalRate: 2,
      },
    });

    movie = new Movie({
      _id: movieId,
      title: "abcde",
      dailyRentalRate: 2,
      genre: { name: "xxxxx" },
      numberInStock: 10,
    });

    await movie.save();
    await rental.save();
  });

  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });

  it("should work", async () => {
    const result = Rental.findById(rental._id);
    expect(result).not.toBeNull();
  });

  it("should return 401 if client is not logged in", async () => {
    token = "";
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if customerId is not provided", async () => {
    customerId = "";
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 400 if movieId is not provided", async () => {
    movieId = "";
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental found for this customer/movie", async () => {
    await Rental.deleteMany({});

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it("should return 400 if rental is alreasdy processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if we have a valid request", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should set the return date if input is valid", async () => {
    await exec();

    const retalInDb = await Rental.findById(rental._id);

    const diff = new Date() - retalInDb.dateReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should set the rental fee if input is valid", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();

    await exec();

    const rentalInDb = await Rental.findById(rental._id);

    expect(rentalInDb.rentalFee).toBe(14);
  });

  it("should set the rental fee if input is valid", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();

    await exec();

    const rentalInDb = await Rental.findById(rental._id);

    expect(rentalInDb.rentalFee).toBe(14);
  });

  it("should increase the movie stock if input is valid", async () => {
    await exec();

    const movieInDb = await Movie.findById(movie._id);

    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rental in the body of response", async () => {
    const res = await exec();
    
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining([
      "dateOut", "dateReturned", "rentalFee", "customer", "movie"
    ]));
  });
});
