'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(prescribeMedicine) {
  Composer.restrictModelMethods(prescribeMedicine);
};
