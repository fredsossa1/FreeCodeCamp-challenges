const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

require("dotenv").config();
require("dotenv").config();

var mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new Schema(
  {
    username: { type: String, required: true },
  },
  { versionKey: false }
);

let User = mongoose.model("User", userSchema);

const exerciseSchema = new Schema(
  {
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

let Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

//Post to /api/users with form data username to create a new user
app.post("/api/users", (req, res) => {
  const user = new User({
    username: req.body.username,
  });

  user.save(function (err, data) {
    if (err) console.error(err);
    res.json(data);
  });
});

//Get to /api/users to get all users

app.get("/api/users", (req, res) => {
  User.find({}, (err, data) => {
    if (err) return console.log(err);
    res.json(data);
  });
});

// Post to /api/users/:_id/exercises with form data description,
//duration, and optionally date. If no date is supplied,
//the current date will be used.

app.post("/api/users/:_id/exercises", (req, res) => {
  let userId = req.params["_id"];
  let formDate;
  if (req.body.date) {
    formDate = new Date(req.body.date);
  }

  User.findById(userId, (err, userData) => {
    if (err) return console.log("User not found");

    const exercise = new Exercise({
      username: userData.username,
      description: req.body.description,
      duration: req.body.duration,
      date: formDate ? formDate.toDateString() : new Date().toDateString(),
    });

    exercise.save(function (err, data) {
      if (err) console.error(err);
      res.json({
        username: userData.username,
        description: data.description,
        duration: data.duration,
        date: new Date(data.date).toDateString(),
        _id: userData["_id"],
      });
    });
  });
});

// GET request to /api/users/:_id/logs
//to retrieve a full exercise log of any user.
app.get("/api/users/:_id/logs", (req, res) => {
  let userId = req.params["_id"];
  let from = new Date(req.query.from);
  let to = new Date(req.query.to);
  let limit = Number(req.query.limit);

  User.findById(userId, (err, userData) => {
    if (err) return console.log("User not found");
    if (userData === null) res.send({ error: "User not found" });

    let query = Exercise.find({ username: userData.username }).select(
      "-_id -username"
    );

    if (isValidDate(from)) query.where("date").gte(from);
    if (isValidDate(to)) query.lte(to);
    if (!isNaN(limit)) query.limit(limit);

    query.exec((err, data) => {
      if (err) console.error(err);

      let exercises = data.map((item) => {
        let date = new Date(item.date);
        return {
          description: item.description,
          duration: item.duration,
          date: date.toDateString(),
        };
      });

      res.json({
        username: userData.username,
        count: data.length,
        _id: userData["_id"],
        log: exercises,
      });
    });
  });
});

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}
