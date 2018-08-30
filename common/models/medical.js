'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(medical) {
  Composer.restrictModelMethods(medical);
};
