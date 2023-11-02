module.exports = {
  fileMatch: (fnm) => fnm.endsWith("postgresql.conf"),
  parser: { from(fileStr) {}, to(value) {} },
};
