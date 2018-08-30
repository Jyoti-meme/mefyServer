'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(individual) {
  Composer.restrictModelMethods(individual);
};
