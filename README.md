pyre-to-regexp
==============

### Converts Python-like (re) regular expressions to JavaScript RegExp instances

[![Build Status](https://travis-ci.org/jmchilton/pyre-to-regexp.svg?branch=master)](https://travis-ci.org/jmchilton/pyre-to-regexp)

This project is a fork of the MIT licensed [pcre-to-regexp](https://github.com/TooTallNate/pcre-to-regexp)
project from @TooTallNate. This fork is also MIT licensed.

Creates a JavaScript `RegExp` instance from a Python-like regexp string.

Works with Node.js and in the browser via a CommonJS bundler like browserify.

Installation
------------

``` bash
$ npm install pyre-to-regexp
```

API
---

### pyre(String pattern[, Array keys]) → RegExp

Returns a JavaScript RegExp instance from the given Python-like regular expression string.

An empty array may be passed in as the second argument, which will be
populated with the "named capture group" names as Strings in the Array,
once the RegExp has been returned.

The returned RegExp has an additional function `pyreReplace`, for Python-like replacements
