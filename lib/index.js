const fs = require("fs");
const path = require("path");
const { runInNewContext } = require("vm");

const parsers = require("fs")
  .readdirSync(path.join(__dirname, "parsers"))
  .filter((f) => f.endsWith(".js"))
  .map(function (file) {
    return require("./parsers/" + file);
  });

const find_parser_for_file = (fnm) => parsers.find((p) => p.fileMatches(fnm));

const stdContext = {
  set(xs, i, x) {
    let ys = [...xs];
    ys[i] = x;
    return ys;
  },
};

const patch = (obj, expr) => {
  const newObj = runInNewContext(`()=>(${expr})`, { ...obj, stdContext });
  Object.assign(obj, newObj());
  return obj;
};

module.exports = { parsers, find_parser_for_file, patch };
