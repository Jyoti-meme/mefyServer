'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(subscription) {
  Composer.restrictModelMethods(subscription);
};
