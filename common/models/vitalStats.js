'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(vitalStats) {
  Composer.restrictModelMethods(vitalStats);
};
