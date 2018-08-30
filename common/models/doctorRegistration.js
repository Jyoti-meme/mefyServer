'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(doctorRegistration) {
  Composer.restrictModelMethods(doctorRegistration);
};
