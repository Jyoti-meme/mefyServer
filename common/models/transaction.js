'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(transaction) {
  Composer.restrictModelMethods(transaction);
};
