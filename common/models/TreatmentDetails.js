'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(TreatmentDetails) {
  Composer.restrictModelMethods(TreatmentDetails);
};
