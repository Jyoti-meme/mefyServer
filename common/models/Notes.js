'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Notes) {
  Composer.restrictModelMethods(Notes);
};
