module.exports = {
  name: "postgresql.conf",
  fileMatches: (fnm) => fnm.endsWith("postgresql.conf"),
  parser: {
    from(fileStr) {
      const value = {};
      fileStr.split("\n").forEach((line, lineNum) => {
        if (!line) value[`__blank__${lineNum}`] = true;
        else if (line.trimStart()[0] === "#")
          value[`__comment__${lineNum}`] = line;
        else {
          const [beforeComment, afterComment] = line.split("#");
          const [beforeEqNoTrim, afterEqNoTrim] = beforeComment.split("=");
          const beforeEq = beforeEqNoTrim.trim();
          const afterEq = afterEqNoTrim.trim();
          if (afterComment) {
            const ntabs = beforeComment.split("\t").length - 1;
            value[`__inline_comment__${lineNum}`] = [
              afterComment,
              line.indexOf("#") - ntabs,
              ntabs,
            ];
          }
          value[beforeEq] = afterEq;
        }
      });
      return value;
    },
    to(value) {
      let stashed_line_comment;
      return Object.entries(value)
        .map(([k, v]) => {
          if (k.startsWith("__blank__")) return "";
          else if (k.startsWith("__inline_comment__")) {
            stashed_line_comment = v;
            return false;
          } else if (k.startsWith("__comment__")) return v;
          else {
            const baseStr = `${k} = ${v}`;

            if (stashed_line_comment) {
              const [comment, commentIx, ntabs] = stashed_line_comment;
              stashed_line_comment = null;

              return (
                baseStr +
                "\t".repeat(ntabs) +
                "# " +
                comment.padStart(Math.max(0, commentIx - baseStr.length - 2))
              );
            } else return baseStr;
          }
        })
        .filter((ln) => ln !== false)
        .join("\n");
    },
  },
};
