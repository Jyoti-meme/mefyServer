'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(DrugType) {
  Composer.restrictModelMethods(DrugType);
};
