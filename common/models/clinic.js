'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(clinic) {
  const enabledRemoteMethods = ["findById", "create", "deleteById","find"];
  clinic.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      clinic.disableRemoteMethodByName(methodName);
    }
  });
};
