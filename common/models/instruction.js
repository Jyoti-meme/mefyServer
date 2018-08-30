'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(instruction) {
  Composer.restrictModelMethods(instruction);
};
