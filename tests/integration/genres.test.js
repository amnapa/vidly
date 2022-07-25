const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const request = require("supertest");
const mongoose = require("mongoose");
let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({});
  });
  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);

      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a genre if a valid id is passed", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const res = await request(server).get("/api/genres/" + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/genres/1");

      expect(res.status).toBe(404);
    });

    it("should return 404 if no genre with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/genres/" + id);

      expect(res.status).toBe(404);
    });
  });

  describe("Post /", () => {
    //Define happy path, in each test change one parameter that align with name of the test
    let token;
    let name;

    const exec = async () => {
      return await request(server)
        .post("/api/genres/")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("should return a 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return a 400 if genre is less than five characters", async () => {
      name = "aaaa";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return a 400 if genre is more than 50 characters", async () => {
      name = Array(52).join("x");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      await exec();

      const genre = await Genre.findOne({ name: "genre1" });

      expect(genre).not.toBe(null);
    });

    it("should return the genre if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  describe("Put /", () => {
    //Define happy path, in each test change one parameter that align with name of the test
    let token;
    let objectId;
    let updateName;

    beforeEach(() => {
      token = new User({ isAdmin: true }).generateAuthToken();
      updateName = "genre2";
      objectId = mongoose.Types.ObjectId();
    });

    const exec = async () => {
      return request(server)
        .put("/api/genres/" + objectId)
        .set("x-auth-token", token)
        .send({ name: updateName });
    };

    it("should return a 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 404 if no genre with the given id exists", async () => {
      objectId = mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return the updated genre if the update was successful", async () => {
      const genre = await new Genre({ name: "genre1" }).save();
      objectId = genre._id;
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "genre2");
    });

    it("should return 404 error if we supply a valid objectId that does not belong to any existing genre", async () => {
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /", () => {
    let token;
    let objectId = new mongoose.Types.ObjectId();

    beforeEach(() => {
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .delete("/api/genres/" + objectId)
        .set("x-auth-token", token);
    };

    it("should return 404 error if we supply an invalid object id parameter", async () => {
      objectId = "";
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 error if we supply a valid objectId that does not belong to any existing genre", async () => {
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return the deleted genre if the delete was successful", async () => {
      const genre = await new Genre({ name: "genre1"}).save();
      objectId = genre._id;

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });
});
