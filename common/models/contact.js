'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(contact) {
  Composer.restrictModelMethods(contact);
};
