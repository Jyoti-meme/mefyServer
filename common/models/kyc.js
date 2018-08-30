'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(kyc) {
  Composer.restrictModelMethods(kyc);
};
