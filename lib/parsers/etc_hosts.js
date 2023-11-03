module.exports = {
  name: "etc_hosts",
  fileMatches: (fnm) => fnm === "/etc/hosts",
  from(fileStr) {
    const value = new Map();
    fileStr.split("\n").forEach((line, lineNum) => {
      if (!line) value[`__blank__${lineNum}`] = true;
      else if (line.trimStart()[0] === "#")
        value[`__comment__${lineNum}`] = line;
      else {
        const [beforeComment, afterComment] = line.split("#");
        const [ip, ...aliases] = beforeComment
          .split(/(\s+)/)
          .filter((e) => e.trim().length > 0);
        if (afterComment) {
          const ntabs = beforeComment.split("\t").length - 1;
          value[`__inline_comment__${lineNum}`] = [
            afterComment,
            line.indexOf("#") - ntabs,
            ntabs,
          ];
        }
        if (!value[ip]) value[ip] = aliases;
        else value[ip].push(...aliases);
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
          const aliases = typeof v === "string" ? v : v.join(" ");
          const baseStr = k + " " + aliases;

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
  pretty(value) {
    return Object.fromEntries(
      Object.entries(value).filter(([k, v]) => !k.startsWith("__"))
    );
  },
};
