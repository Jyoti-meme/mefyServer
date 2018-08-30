'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(PharmacyItem) {
  Composer.restrictModelMethods(PharmacyItem);
};
