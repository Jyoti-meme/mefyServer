'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(TreatmentTaken) {
  Composer.restrictModelMethods(TreatmentTaken);
};
