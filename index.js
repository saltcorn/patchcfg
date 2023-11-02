const parser = require("./lib/parsers/postgresql_conf");
const fs = require("fs");
const helpText = `patchcfg [-hvpo] file [patch-expr]

Command line switches:

  -v          : verbose
  -h, --help  : help
  -p [parser] : specify a parser to use
  -o [file]   : output to a different file (or - for stdout) instead of edit-in-place

  file        : The configuration file to patch
  patch-expr  : JavaScript expression for object with values to edit

`;

const getArgs = () => {
  const myArgs = process.argv.slice(2);
  const flags = {};
  let file, patchExpr;

  if (myArgs.length === 0) {
    console.log(helpText);
    process.exit(0);
  }

  let flagsDone = false;
  for (let i = 0; i < myArgs.length; i++) {
    const arg = myArgs[i];

    if (!flagsDone && arg[0] !== "-") flagsDone = true;
    if (!flagsDone) {
      switch (arg) {
        case "-v":
          flags.verbose = true;
          break;
        case "-h":
        case "--help":
          console.log(helpText);
          process.exit(0);
          break;
        case "-o-":
          flags.outfile = "-";
          break;
        case "-o":
          flags.outfile = myArgs[i + 1];
          i++;
          break;
        case "-p":
          flags.processor = myArgs[i + 1];
          i++;
          break;

        default:
          break;
      }
    } else {
      if (file) patchExpr = arg;
      else file = arg;
    }
  }

  return { flags, file, patchExpr };
};

const patch = (obj, expr) => {
  return obj;
};
(async () => {
  const { flags, file, patchExpr } = getArgs();
  if (flags.verbose) console.log({ flags, file, patchExpr });
  const fileStr = fs.readFileSync(file).toString();
  const parsed = parser.parser.from(fileStr);
  if (!patchExpr) {
    console.log(parsed);
  } else {
    const patched = patch(parsed, patchExpr);
    const output = parser.parser.to(patched);
    if (flags.outfile === "-") {
      console.log(output);
    } else if (flags.outfile) {
      fs.writeFileSync(flags.outfile, output);
    } else {
      fs.writeFileSync(file, output);
    }
  }
})();
