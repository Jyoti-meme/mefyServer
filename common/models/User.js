'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(User) {
  Composer.restrictModelMethods(User);
};
