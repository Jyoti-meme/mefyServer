'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(order) {
  Composer.restrictModelMethods(order);
};
