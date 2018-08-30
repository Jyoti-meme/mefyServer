'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(transactionMaster) {
  Composer.restrictModelMethods(transactionMaster);
};
