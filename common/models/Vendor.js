'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Vendor) {
  Composer.restrictModelMethods(Vendor);
};
