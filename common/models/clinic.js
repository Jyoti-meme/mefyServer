'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(clinic) {
  Composer.restrictModelMethods(clinic);
};
