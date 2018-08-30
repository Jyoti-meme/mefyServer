'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Question) {
  Composer.restrictModelMethods(Question);
};
