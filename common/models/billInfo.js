'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(billInfo) {
  Composer.restrictModelMethods(billInfo);
};
