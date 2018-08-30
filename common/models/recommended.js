'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(recommended) {
  Composer.restrictModelMethods(recommended);
};
