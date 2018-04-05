
var PCRE = require('../');
var assert = require('assert');
YAML = require('yamljs');
var tests = YAML.load('test/test-data.yml')

function itShouldMatch(regexpDescription) {
  var against = regexpDescription.against;
  var regex = regexpDescription.regex;
  var replacement = regexpDescription.replacement;
  var invalidReplacement = regexpDescription.invalid_replacement;

  if(regexpDescription.captures) {
    it(regex + ' should capture ' + regexpDescription.captures + " against " + regexpDescription.against, function() {
      var exp = PCRE(regex);
      var match = exp.exec(against);
      assert.equal(match[0], regexpDescription.captures);
    });
  } else if(regexpDescription.matches === true) {
    it(regex + ' should match ' + against, function() {
      var exp = PCRE(regex);
      var match = exp.exec(against);
      assert(match);
    });
  } else if(regexpDescription.matches === false) {
    it(regex + ' should not match ' + against, function() {
      var exp = PCRE(regex);
      var match = exp.exec(against);
      assert(!match);
    });
  } else if(replacement && invalidReplacement) {
    var replacement = replacement;
    var becomes = regexpDescription.becomes;
    it(regex + ' with replacement ' + replacement + " throws error", function() {
      var exp = PCRE(regex);
      assert.throws(function() {exp.pyreReplace(against, replacement)}, Error);
    });
  } else if(replacement) {
    var replacement = replacement;
    var becomes = regexpDescription.becomes;
    it(regex + ' against ' + against + ' after replacement on ' + replacement + ' should be ' + becomes, function() {
      var exp = PCRE(regex);
      var actualBecomes = exp.pyreReplace(against, replacement);
      assert.equal(becomes, actualBecomes);
    });
  } else {
    assert(false);
  }
}

describe('PCRE(pattern[, flags])', function () {

  it('should export a Function', function () {
    assert('function' === typeof PCRE);
  });

  it('should return a RegExp instance', function () {
    var r = PCRE();
    assert(isRegExp(r));
  });

  describe('regular expression matching', function() {
    tests.forEach(itShouldMatch);
  });

  describe('given "https?:\/\/speakerdeck.com\/.*"', function () {

    it('should match "https://speakerdeck.com/tootallnate/node-gyp-baynode-meetup-september-6-2012"', function () {
      var url = 'https://speakerdeck.com/tootallnate/node-gyp-baynode-meetup-september-6-2012';
      var re = PCRE("https?:\/\/speakerdeck.com\/.*");
      assert(re.test(url));
    });

  });

  describe('given "^https?:\/\/twitter\\.com(\/\\#\\!)?\/(?P<username>[a-zA-Z0-9_]{1,20})\\\/status(es)?\/(?P<id>\\d+)\/?$"', function () {

    it('should have [ , "username", , "id" ] for keys', function () {
      var keys = [];
      var re = PCRE("^https?:\/\/twitter\\.com(\/\\#\\!)?\/(?P<username>[a-zA-Z0-9_]{1,20})\\\/status(es)?\/(?P<id>\\d+)\/?$", keys);
      var expectedKeys = new Array(4);
      expectedKeys[1] = 'username';
      expectedKeys[3] = 'id';
      assert.deepEqual(keys, expectedKeys);
    });

    it('should match "https://twitter.com/tootallnate/status/481604870626349056"', function () {
      var re = PCRE("^https?:\/\/twitter\\.com(\/\\#\\!)?\/(?P<username>[a-zA-Z0-9_]{1,20})\\\/status(es)?\/(?P<id>\\d+)\/?$");
      var match = re.exec('https://twitter.com/tootallnate/status/481604870626349056');
      assert(match);
      assert(match[2] === 'tootallnate');
      assert(match[4] === '481604870626349056');
    });

  });

});

function isRegExp(re) {
  return typeof re === 'object' &&
    re !== null &&
    Object.prototype.toString.call(re) === '[object RegExp]';
}
