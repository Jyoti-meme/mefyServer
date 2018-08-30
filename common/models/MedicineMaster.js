'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(MedicineMaster) {
  Composer.restrictModelMethods(MedicineMaster);
};
