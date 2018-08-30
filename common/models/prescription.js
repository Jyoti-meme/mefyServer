'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(prescription) {
  Composer.restrictModelMethods(prescription);
};
