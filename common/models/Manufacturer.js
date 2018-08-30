'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Manufacturer) {
  Composer.restrictModelMethods(Manufacturer);
};
