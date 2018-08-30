'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(QOptions) {
  Composer.restrictModelMethods(QOptions);
};
