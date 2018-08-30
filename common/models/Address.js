'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Address) {
  Composer.restrictModelMethods(Address);
};
