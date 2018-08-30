'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Duration) {
  Composer.restrictModelMethods(Duration);
};
