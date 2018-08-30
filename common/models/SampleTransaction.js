'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(SampleTransaction) {
  Composer.restrictModelMethods(SampleTransaction);
};
