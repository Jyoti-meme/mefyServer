'use strict';

const Composer = require('../lib/composer.js');
const moment = require('moment');
const app = require('../../server/server');

module.exports = function (callhistory) {
  const enabledRemoteMethods = ["findById", "find", "deleteById", "savecall", "updatecallhistory", "individualCall", "doctorCall"];
  callhistory.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      callhistory.disableRemoteMethodByName(methodName);
    }
  });

  /****************************** CREATE CALL HISTORY ********************************** */

  callhistory.remoteMethod('savecall', {
    http: { path: '/savecall', verb: 'post' },
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any', root: true },
  });

  callhistory.savecall = function (data, cb) {
    console.log('data', data)
    // save callhistory
    callhistory.create(data, function (err, res) {
      console.log('res', res)
      console.log('err', err)
      if (!err) {
        let response = {
          error: false,
          message: "Call History Saved",
          result: res
        }
        cb(null, response)
      }
      else {
        let response = {
          error: true,
          message: "Call History Not Saved"
        }
        cb(null, response)
      }
    })
  }

  /**************************************** ENDS *********************************************** */

  /*************************************** UPDATE CALL HISTORY********************************************************* */
  callhistory.remoteMethod('updatecallhistory', {
    http: { path: '/updatecallhistory/:callId', verb: 'put' },
    description: "update call  by callId",
    accepts: [
      { arg: 'callId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'data', type: 'obj', http: { source: 'body' } }
    ],
    returns: { arg: 'result', type: 'any', root: true },
  });

  callhistory.updatecallhistory = function (callId, data, cb) {
    console.log(callId);
    console.log(data);
    callhistory.findOne({ where: { callId: callId } }, function (err, exists) {
      console.log('err', err);
      console.log('res', exists)

      if (!err) {
        if (exists != null && Object.keys(exists).length != 0) {
          // update call instance
          exists.updateAttributes(data, function (err, res) {
            console.log('err', err);
            console.log('res', res)
            if (!err) {
              let result = {
                err: false,
                result: res,
                message: 'Call Updated Successfully'
              }
              cb(null, result)
            }
            else {
              let result = {
                err: true,
                message: 'Updation Failed'
              }
              cb(null, result)
            }
          })
        }
        else {
          let res = {
            error: false,
            message: 'Call History Not Found'
          }
          cb(null, res)
        }
      }
    })
  }
  /***************************************** ENDS ***************************************************** */

  /************************************** GET CALLHISTORY BY INDIVIDUAL ID ***************************************************** */

  callhistory.remoteMethod('individualCall', {
    http: { path: '/individualCall', verb: 'get' },
    description: "update call  by callId",
    accepts: { arg: 'individualId', type: 'string', required: true },
    returns: { arg: 'result', type: 'any', root: true },
  });

  callhistory.individualCall = function (individualId, cb) {
    console.log('individualid', individualId)
    callhistory.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individualId } }, function (err, exists) {
      console.log('error', err);
      console.log('exists', exists);
      if (!err) {
        if (exists != null && exists.length != 0) {
          let response = {
            err: false,
            message: 'Individual Call History',
            result: exists
          }
          cb(null, response)
        }
        else {
          let response = {
            err: false,
            message: 'Individual Call History',
            result: []
          }
          cb(null, response)
        }
      }
      else {
        let response = {
          err: true,
          message: 'Something went wrong',
        }
        cb(null, response)
      }
    })
  }

  /*********************************************** ENDS ******************************************** */

  /************************************** GET CALLHISTORY BY DOCTOR ID ***************************************************** */

  callhistory.remoteMethod('doctorCall', {
    http: { path: '/doctorCall', verb: 'get' },
    description: "update call  by callId",
    accepts: { arg: 'doctorId', type: 'string', required: true },
    returns: { arg: 'result', type: 'any', root: true },
  });

  callhistory.doctorCall = function (doctorId, cb) {
    console.log('individualid', doctorId)
    callhistory.find({ where: { doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (err, exists) {
      console.log('error', err);
      console.log('exists', exists);
      if (!err) {
        if (exists != null && exists.length != 0) {
          let response = {
            err: false,
            message: 'Doctor Call History',
            result: exists
          }
          cb(null, response)
        }
        else {
          let response = {
            err: false,
            message: 'Doctor Call History',
            result: []
          }
          cb(null, response)
        }
      }
      else {
        let response = {
          err: true,
          message: 'Something went wrong',
        }
        cb(null, response)
      }
    })
  }

  /*********************************************** ENDS ******************************************** */

  /***************************************  POPULATE INDIVIDUAL AND DOCTOR FIELD********************************************** */
  callhistory.observe('loaded', function (context, next) {
    const Individual = app.models.individual;
    const Doctor = app.models.doctor;
    // FETCH INDIVIDUAL DETAILS
    console.log('contextdata', context.data.individualId)
    Individual.findOne({ where: { individualId: context.data.individualId.includes('#') ? context.data.individualId.split('#')[1] : context.data.individualId } }, function (indverr, indv) {
      console.log('indv err', indverr);
      context.data.individuals = indv;
      delete context.data['individualId'];
      Doctor.findOne({ where: { doctorId: context.data.doctorId.includes('#') ? context.data.doctorId.split('#')[1] : context.data.doctorId } }, function (docerr, doctor) {
        console.log('doctor err', docerr);
        console.log('doctor details', doctor)
        context.data.doctors = doctor;
        delete context.data['doctorId'];
        next();
      })
      // if (!err && Object.keys(indv).length != 0) {
      //   console.log('INDIVIDUAL DETAILS', indv);
      //   context.data.individuals = indv;
      //   console.log('contexti indv data', context.data)
      //   delete context.data['individualId'];
      //   next();
      // }
      // else{
      //   next();
      // }

    })
  });
  /******************************************* ENDS *************************************************** */
}