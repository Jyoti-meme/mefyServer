'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Family) {
  Composer.restrictModelMethods(Family);
};
