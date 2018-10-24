'use strict';

const Composer = require('../lib/composer.js');
const moment = require('moment');

module.exports = function (medical) {
  // Composer.restrictModelMethods(medical);


  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find","addMedical"];
  medical.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      medical.disableRemoteMethodByName(methodName);
    }
  });


  /*********************** ADD MEDICAL RECORD FOR CURRENT COMPLAINT NO  ****************** */

  medical.remoteMethod('addMedical', {
    http: { path: '/addmedical', verb: 'post' },
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' },
  });

  medical.addMedical = function (data, cb) {
    // calculate startdate from duration duration
    var startDate = moment().subtract(data.duration.years, 'year').subtract(data.duration.months, 'month').subtract(data.duration.days, 'day').toISOString()
    console.log(moment().subtract(1, 'year').subtract(0, 'month').subtract(1, 'day').toISOString())
    data.sufferingDate = {
      start: startDate
    }
    medical.create(
      {
        individualId: data.individualId, healthRecordType: data.healthRecordType, sympton: data.sympton, duration: data.duration,
        sufferingDate: data.sufferingDate,status:'unsolved'
      }, function (err, res) {
        console.log('eesult', res)
        let result = {
          error: false,
          clinic: res,
          message: "complaint added  successfully"
        }
        cb(null, result);
      })
  }

  /***************************************  END  ************************************************ */
};
