'use strict';

const Composer = require('../lib/composer.js');
const moment = require('moment');

module.exports = function (medical) {
  // Composer.restrictModelMethods(medical);


  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find", "addMedical", "indvCurrentComplaint", "changeStatusCurrentComplaint"];
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
    if(data.healthRecordType=='currentComplaint')
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
      else{
        medical.create(
          {
            individualId: data.individualId, healthRecordType: data.healthRecordType, sympton: data.sympton, duration: data.duration,
            sufferingDate: data.sufferingDate,status: 'solved'
          }, function (err, res) {
            console.log('eesult', res)
            let result = {
              error: false,
              clinic: res,
              message: " Medical Record Created  successfully"
            }
            cb(null, result);
          })
      }
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

  /*************************************** CHANGE STATUS OF CURRENT COMPLIANT *********************************** */
  medical.remoteMethod('changeStatusCurrentComplaint', {
    http: { path: '/currentcomplaintstatus/:medicalId', verb: 'put' },
    accepts: { arg: 'medicalId', type: 'string', required: true, http: { source: 'path' } },
    returns: { arg: 'result', type: 'any' },
  });

  medical.changeStatusCurrentComplaint = function (medicalId, cb) {
    console.log('medicalid', medicalId)
    medical.findOne({ where: { medicalId: medicalId } }, function (err, result) {
      console.log('result', result)
      result.updateAttribute('status', 'solved', function (err, response) {
        console.log(response)
        if (err) {
          let response = {
            error: true,
            message: 'Something went wrong '
          }
          cb(null, response);
        }
        else {
          let response = {
            error: false,
            message: 'Status changed successfully'
          }
          cb(null, response);
        }

      });
    });
  }
  /****************************************** ENDS ************************************************************** */
};
