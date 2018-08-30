'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(family) {
  Composer.restrictModelMethods(family);
};
