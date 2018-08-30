'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(familyMember) {
  Composer.restrictModelMethods(familyMember);
};
