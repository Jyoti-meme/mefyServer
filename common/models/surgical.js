'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(surgical) {
  Composer.restrictModelMethods(surgical);

  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find","addsurgical"];
  surgical.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      surgical.disableRemoteMethodByName(methodName);
    }
  });


/****************************************** ADD SURGERY ********************************** */
surgical.remoteMethod('addsurgical', {
  http: { path: '/addsurgical', verb: 'post' },
  accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
  returns: { arg: 'result', type: 'any' },
});

surgical.addsurgical = function (data, cb) {
  console.log('data',data)
  surgical.create({
    individualId: data.individualId, disease: data.disease, dateOfDiagnosis: data.dateOfDiagnosis,
    healthRecordType: data.healthRecordType, currentStatus: data.currentStatus, signsAndSympton: data.signsAndSympton,otherInformation:data.otherInformation,
    treatmentDetails: data.treatmentDetails,surgery:data.surgery
  }, function (err, res) {
    console.log('response', res, err);
    if (err) {
      let result = {
        error: true,
        message: 'surgical creation failed'
      }
    }
    else {
      let result = {
        error: false,
        result: res,
        message: "surgical created successfully"
      }
      cb(null, result);
    }

  })
}
/************************************************* END ****************************************/

};
