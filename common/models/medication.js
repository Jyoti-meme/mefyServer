'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(medication) {
  Composer.restrictModelMethods(medication);
};
