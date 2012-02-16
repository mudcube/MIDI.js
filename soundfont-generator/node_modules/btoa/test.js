(function () {
  "use strict";

  var atob = require('./index')
    , expected = "SGVsbG8gV29ybGQ="
    , result
    ;

  if (expected !== atob("Hello World")) {
    return;
  }

  console.log('[PASS] all tests pass');
}());
