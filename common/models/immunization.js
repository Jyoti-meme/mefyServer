'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(immunization) {
  // Composer.restrictModelMethods(immunization);

  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find","addimmunization"];
  immunization.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      immunization.disableRemoteMethodByName(methodName);
    }
  });

/************************************* ADD IMMUNIZATION ******************************************* */

immunization.remoteMethod('addimmunization', {
  http: { path: '/addimmunization', verb: 'post' },
  accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
  returns: { arg: 'result', type: 'any' },
});


immunization.addimmunization = function (data, cb) {
  console.log(data)
  immunization.create(
    {individualId: data.individualId, healthRecordType: data.healthRecordType,vaccine: data.vaccine,ageGroup: data.ageGroup
    }, function (err, res) {
      console.log('result', res,err)
      let result = {
        error: false,
        clinic: res,
        message: "Immunization created successfully"
      }
      cb(null, result);
    })
}

/******************************************* ENDS **************************************************** */
};
