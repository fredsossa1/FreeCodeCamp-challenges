require("dotenv").config();
var bodyParser = require("body-parser");
var express = require("express");
var app = express();
console.log("Hello World");

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(__dirname + "/public"));

app.use((req, res, next) => {
  console.log(req.method + " /" + req.path + " - " + req.ip);
  next();
});

app.get("/", (req, res) => {
  let filepath = __dirname + "/views/index.html";
  res.sendFile(filepath);
});

app.get(
  "/now",
  (req, res, next) => {
    req.time = new Date().toString();
    next();
  },
  (req, res) => {
    res.json({ time: req.time });
  }
);

app.get("/json", (req, res) => {
  let message = "Hello json";
  if (process.env.MESSAGE_STYLE == "uppercase")
    res.json({ message: message.toUpperCase() });
  else res.json({ message: message });
});

app.get("/:word/echo", (req, res) => {
  res.json({ echo: req.params.word });
});

app
  .route("/name")
  .get((req, res) => {
    res.json({ name: req.query.first + " " + req.query.last });
  })
  .post((req, res) => {
    res.json({ name: req.body.first + " " + req.body.last });
  });

module.exports = app;
