'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(UserPharmacy) {
  Composer.restrictModelMethods(UserPharmacy);
};
