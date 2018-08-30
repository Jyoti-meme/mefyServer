'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(allergies) {
  Composer.restrictModelMethods(allergies);
};
