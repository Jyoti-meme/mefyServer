'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(preRegistration) {
  Composer.restrictModelMethods(preRegistration);
};
