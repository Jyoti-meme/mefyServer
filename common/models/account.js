'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(account) {
  Composer.restrictModelMethods(account);
};
