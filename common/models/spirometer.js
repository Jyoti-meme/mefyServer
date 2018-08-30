'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(spirometer) {
  Composer.restrictModelMethods(spirometer);
};
