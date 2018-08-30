'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(surgical) {
  Composer.restrictModelMethods(surgical);
};
