const fs = require("fs");
const path = require("path");

const parsers = require("fs")
  .readdirSync(path.join(__dirname, "parsers"))
  .filter((f) => f.endsWith(".js"))
  .map(function (file) {
    return require("./parsers/" + file);
  });

module.exports = { parsers };
