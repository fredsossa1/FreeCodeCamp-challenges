require("dotenv").config();
var bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const url = require("url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

let urls = [];

app.route("/api/shorturl").post(function (req, res) {
  let short_url;
  let original_url = req.body.url;
  let host_url = getHostFromUrl(original_url);

  console.log("URL: ", original_url);
  console.log("HOST URL: ", host_url);

  dns.resolve(host_url, async (err, address, family) => {
    if (err) res.json({ error: "invalid url" });
    else {
      if (urls.includes(original_url)) {
        short_url = urls.indexOf(original_url) + 1;
      } else {
        urls.push(original_url);
        short_url = urls.length;
      }

      res.json({ original_url: original_url, short_url: short_url });
    }
  });
});

app.route("/api/shorturl/:shortId").get((req, res) => {
  let original_url = urls[req.params.shortId - 1];

  if (original_url) return res.redirect(original_url);
  else res.json({ error: "invalid url" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

function getHostFromUrl(original_url) {
  // https://forum.freecodecamp.org/
  try {
    let myUrl = new URL(original_url);
    if (myUrl.protocol == "https:" || myUrl.protocol == "http:")
      return myUrl.hostname;
    else return "";
  } catch (e) {
    if (e instanceof TypeError) {
      return "";
    }
  }
}
