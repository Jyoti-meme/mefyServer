'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(lifeStyle) {
  Composer.restrictModelMethods(lifeStyle);
};
