(function () {
  "use strict";

  function atob(str) {
    return new Buffer(str, 'base64').toString('utf8');
  }

  module.exports = atob;
}());
