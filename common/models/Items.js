'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Items) {
  Composer.restrictModelMethods(Items);
};
