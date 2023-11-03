# patchcfg

Programmatically edit configuration files with JSON expressions

```
patchcfg [-hvpo] file [patch-expr]

Command line switches:

  -v          : verbose
  -h, --help  : help
  -p [parser] : specify a parser to use
  -o [file]   : output to a different file (or - for stdout) instead of edit-in-place

  file        : The configuration file to patch
  patch-expr  : JavaScript expression for object with values to edit

Available parsers: etc_hosts, postgresql.conf
```
