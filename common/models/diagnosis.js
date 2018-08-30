'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(diagnosis) {
  Composer.restrictModelMethods(diagnosis);
};
