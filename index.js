/**
 * Module exports.
 */

exports = module.exports = pyre;

/**
 * Returns a JavaScript RegExp instance from the given Python-like string.
 *
 * An empty array may be passsed in as the second argument, which will be
 * populated with the "named capture group" names as Strings in the Array,
 * once the RegExp has been returned.
 *
 * @param {String} pattern - Python-like regexp string to compile to a JS RegExp
 * @return {RegExp} returns a JavaScript RegExp instance from the given `pattern`
 * @public
 */
function pyre(pattern, namedCaptures) {
  pattern = String(pattern || '').trim();

  // populate namedCaptures array and removed named captures from the `pattern`
  namedCaptures = namedCaptures == undefined ? [] : namedCaptures;
  var numGroups = 0;
  pattern = replaceCaptureGroups(pattern, function (group) {
    if (/^\(\?P[<]/.test(group)) {
      // Python-style "named capture"
      // It is possible to name a subpattern using the syntax (?P<name>pattern).
      // This subpattern will then be indexed in the matches array by its normal
      // numeric position and also by name.
      var match = /^\(\?P[<]([^>]+)[>]([^\)]+)\)$/.exec(group);
      if (namedCaptures) namedCaptures[numGroups] = match[1];
      numGroups++;
      return '(' + match[2] + ')';
    } else if ('(?:' === group.substring(0, 3)) {
      // non-capture group, leave untouched
      return group;
    } else {
      // regular capture, leave untouched
      numGroups++;
      return group;
    }
  });

  var regexp = new RegExp(pattern);
  regexp.pyreReplace = function(source, replacement) {
    var jsReplacement = pyreReplacement(replacement, namedCaptures);
    return source.replace(this, jsReplacement);
  }
  return regexp;
}

function pyreReplacement(replacement, namedCaptures) {
  var jsReplacement = "";
  var i = 0;
  var replacementLength = replacement.length;
  while(i < replacementLength) {
    var cur = replacement[i];
    if(cur == '\\' && i != (replacementLength - 1)) {
      var next = replacement[i + 1];
      if(next == '\\') {
        jsReplacement += '\\';
        i += 2;
      } else if(next == 'g' && i < (replacementLength - 3)) {
        var closeIndex = null;
        for(var j = i + 3; j < replacementLength; j++) {
          if(replacement[j] == ">") {
            closeIndex = j;
            break;
          }
        }
        if(replacement[i + 2] == "<" && closeIndex) {
          var group = replacement.substring(i + 3, closeIndex);
          if(isNaN(group)) {
            for(var k = 0; k < namedCaptures.length; k++) {
              if(group == namedCaptures[k]) {
                group = k + 1;
                break;
              }
            }
          }
          jsReplacement += "$" + group;
          i = closeIndex + 1;
        } else if(replacement[i + 2] == "<") {
          throw Error("No close for regular expression replacement group \\g<");
        } else {
          jsReplacement += cur;
          i++;
        }
      } else if(next == '0') {
        jsReplacement += '$&';
        i += 2;
      } else if(!isNaN(next)){
        jsReplacement += '$' + next;
        i += 2;
      } else {
        jsReplacement += cur;
        i++;
      }
    } else if(cur == '$' && i != (replacement.length - 1)) {
      jsReplacement += '$$';
      i++;
    } else {
      jsReplacement += cur;
      i++;
    }
  }
  return jsReplacement;
}

/**
 * Invokes `fn` for each "capture group" encountered in the PCRE `pattern`,
 * and inserts the returned value into the pattern instead of the capture
 * group itself.
 *
 * @private
 */
function replaceCaptureGroups (pattern, fn) {
  var start;
  var depth = 0;
  var escaped = false;

  for (var i = 0; i < pattern.length; i++) {
    var cur = pattern[i];
    if (escaped) {
      // skip this letter, it's been escaped
      escaped = false;
      continue;
    }
    switch (cur) {
      case '(':
        // we're only interested in groups when the depth reaches 0
        if (0 === depth) {
          start = i;
        }
        depth++;
        break;
      case ')':
        if (depth > 0) {
          depth--;

          // we're only interested in groups when the depth reaches 0
          if (0 === depth) {
            var end = i + 1;
            var l = start === 0 ? '' : pattern.substring(0, start);
            var r = pattern.substring(end);
            var v = String(fn(pattern.substring(start, end)));
            pattern = l + v + r;
            i = start;
          }
        }
        break;
      case '\\':
        escaped = true;
        break;
    }
  }
  return pattern;
}
