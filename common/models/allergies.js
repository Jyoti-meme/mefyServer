'use strict';

const Composer = require('../lib/composer.js');

module.exports = function (allergies) {
  Composer.restrictModelMethods(allergies);

  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find", "addallergies"];
  allergies.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      allergies.disableRemoteMethodByName(methodName);
    }
  });





  /****************************************** ADD ALLERGIES ********************************** */
  allergies.remoteMethod('addallergies', {
    http: { path: '/addallergies', verb: 'post' },
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' },
  });

  allergies.addallergies = function (data, cb) {
    allergies.create({
      individualId: data.individualId, startDate: data.startDate, allergyCondition: data.allergyCondition,
      healthRecordType: data.healthRecordType, severity: data.severity, treatmentTaken: data.treatmentTaken
    }, function (err, res) {
      console.log('response', res, err);
      if (err) {
        let result = {
          error: true,
          message: 'Allergy creation failed'
        }
      }
      else {
        let result = {
          error: false,
          result: res,
          message: "allergy created successfully"
        }
        cb(null, result);
      }

    })
  }
  /************************************************* END ****************************************/
  
};
