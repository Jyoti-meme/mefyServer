'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(mefyContact) {
  Composer.restrictModelMethods(mefyContact);
};
