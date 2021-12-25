// server.js
// where your node app starts

// init project
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/:date", function (req, res) {
  let reqDate = req.params.date;
  let date;
  if (isValidDate(new Date(reqDate))) {
    date = new Date(reqDate);
    res.json({ unix: date.getTime(), utc: date.toUTCString() });
  } else if (isValidDate(new Date(parseInt(reqDate)))) {
    date = new Date(parseInt(reqDate));
    res.json({ unix: date.getTime(), utc: date.toUTCString() });
  } else res.json({ error: "Invalid Date" });
});

app.get("/api/", function (req, res) {
  let date = new Date();
  res.json({ unix: date.getTime(), utc: date.toUTCString() });
});

// listen for requests :)
var port = process.env.PORT || 3000;
var listener = app.listen(port, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}
