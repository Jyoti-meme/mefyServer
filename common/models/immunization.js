'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(immunization) {
  Composer.restrictModelMethods(immunization);
};
