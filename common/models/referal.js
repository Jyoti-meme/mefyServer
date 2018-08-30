'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(referal) {
  Composer.restrictModelMethods(referal);
};
