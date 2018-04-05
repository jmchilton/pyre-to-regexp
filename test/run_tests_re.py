import yaml
import re

with open("test-data.yml") as f:
    tests = yaml.load(f)

for test in tests:
    pattern = re.compile(test["regex"])
    against = test["against"]
    matches = test.get("matches", None)
    captures = test.get("captures", None)
    replacement = test.get("replacement", None)
    invalid_replacement = test.get("invalid_replacement", False)
    becomes = test.get("becomes", None)
    if captures:
        match = pattern.match(against)
        assert match
        assert match.group(0) == captures
    elif matches is True:
        match = pattern.match(against)
        assert match, "Regexp [%s] does not match [%s]" % (test["regex"], against)
    elif matches is False:
        match = pattern.match(against)
        assert not match
    elif replacement and invalid_replacement:
        error = False
        try:
            actual_becomes = re.sub(pattern, replacement, against)
        except Exception:
            error = True
        assert error
    elif replacement:
        actual_becomes = re.sub(pattern, replacement, against)
        assert becomes == actual_becomes, "%s != %s" % (becomes, actual_becomes) 
    else:
        assert False, "Unknown test encountered!"