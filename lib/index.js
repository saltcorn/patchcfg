const fs = require("fs");
const path = require("path");

const parsers = require("fs")
  .readdirSync(path.join(__dirname, "parsers"))
  .filter((f) => f.endsWith(".js"))
  .map(function (file) {
    return require("./parsers/" + file);
  });

const find_parser_for_file = (fnm) => parsers.find((p) => p.fileMatches(fnm));

const patch = (obj, expr) => {
  return obj;
};

module.exports = { parsers, find_parser_for_file, patch };
