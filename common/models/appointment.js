'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(appointment) {
  Composer.restrictModelMethods(appointment);
};
