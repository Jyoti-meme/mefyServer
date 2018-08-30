'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Medicine) {
  Composer.restrictModelMethods(Medicine);
};
