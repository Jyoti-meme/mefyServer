'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(eConsult) {
  Composer.restrictModelMethods(eConsult);
};
