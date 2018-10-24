'use strict';

const Composer = require('../lib/composer.js');
const moment = require('moment');

module.exports = function (medical) {
  // Composer.restrictModelMethods(medical);


  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find", "addMedical", "indvCurrentComplaint"];
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
        sufferingDate: data.sufferingDate, status: 'unsolved'
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
  /******************************** GET COMPLAINTS BY INDIVIDUAL ID ************************************** */

  medical.remoteMethod('indvCurrentComplaint', {
    http: { path: '/currentcomplaint', verb: 'get' },
    accepts: { arg: 'individualId', type: 'string' },
    returns: { arg: 'result', type: 'any' },
  });

  medical.indvCurrentComplaint = function (individualId, cb) {
    console.log('individual', individualId)
    medical.find({ where: { and: [{ healthRecordType: 'currentComplaint' }, { individualId: 'resource:io.mefy.individual.individual#' + individualId }] } }, function (err, result) {
      console.log('result', result)
      console.log('error', err)
      let response = {
        error: false,
        result: result,
        message: 'current complaint list get successfully'
      }
      cb(null, response);
    })

  }
  /**************************************************  ENDS ************************************************ */
};
