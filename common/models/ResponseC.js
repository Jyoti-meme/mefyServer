'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(ResponseC) {
  Composer.restrictModelMethods(ResponseC);
};
