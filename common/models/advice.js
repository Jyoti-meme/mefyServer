'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(advice) {
  Composer.restrictModelMethods(advice);
};
