'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(Response) {
  Composer.restrictModelMethods(Response);
};
