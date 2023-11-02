const fs = require("fs");
const { parsers, find_parser_for_file, patch } = require("./lib");
const helpText = `patchcfg [-hvpo] file [patch-expr]

Command line switches:

  -v          : verbose
  -h, --help  : help
  -p [parser] : specify a parser to use
  -o [file]   : output to a different file (or - for stdout) instead of edit-in-place

  file        : The configuration file to patch
  patch-expr  : JavaScript expression for object with values to edit

Available parsers: ${parsers.map((p) => p.name).join(", ")} 

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
          flags.parser = myArgs[i + 1];
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

(async () => {
  const { flags, file, patchExpr } = getArgs();
  if (flags.verbose) console.log({ flags, file, patchExpr });
  if (!file) {
    console.error("No file specified");
    process.exit(1);
  }
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }
  let parser;
  if (flags.parser) {
    parser = parsers.find((p) => p.name === flags.parser);
    if (!parser) {
      console.error(
        `Could not find parser: ${flags.parser}. Available parsers: ${parsers
          .map((p) => p.name)
          .join(", ")}`
      );
      process.exit(1);
    }
  } else {
    parser = find_parser_for_file(file);
    if (!parser) {
      console.error(
        `Could not guess a parser from file name: ${file}. Specify a parser with -p`
      );
      process.exit(1);
    }
  }
  const fileStr = fs.readFileSync(file).toString();
  const parsed = parser.parser.from(fileStr);
  if (!patchExpr) {
    if (parser.parser.pretty && !flags.verbose)
      console.log(parser.parser.pretty(parsed));
    else console.log(parsed);
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
