(function () {
  "use strict";

  function atob(str) {
    return new Buffer(str, 'utf8').toString('base64');
  }

  module.exports = atob;
}());
