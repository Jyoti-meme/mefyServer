'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Pharmacy) {
  Composer.restrictModelMethods(Pharmacy);
};
