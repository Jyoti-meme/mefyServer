'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(bill) {
  Composer.restrictModelMethods(bill);
};
