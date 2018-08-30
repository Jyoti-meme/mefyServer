'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(City) {
  Composer.restrictModelMethods(City);
};
