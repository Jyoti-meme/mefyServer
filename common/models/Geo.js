'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Geo) {
  Composer.restrictModelMethods(Geo);
};
