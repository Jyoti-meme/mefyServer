'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Durations) {
  Composer.restrictModelMethods(Durations);
};
