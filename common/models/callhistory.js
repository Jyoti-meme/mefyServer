'use strict';

const Composer = require('../lib/composer.js');
const moment = require('moment');
const app = require('../../server/server');

module.exports = function (callhistory) {
  const enabledRemoteMethods = ["findById", "find", "deleteById", "savecall", "updatecallhistory"];
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

  /***************************************  POPULATE INDIVIDUAL AND DOCTOR FIELD********************************************** */
  // callhistory.observe('loaded', function (context, next) {
  //   const Individual = app.models.individual;
  //   const Doctor = app.models.doctor;
  //   // FETCH INDIVIDUAL DETAILS
  //   console.log('contextdata', context.data.individualId)
  //   Individual.findOne({where:{individualId:context.data.individualId}},function(err,res){
  //     console.log(err);
  //     console.log(res);

  //   })
  // })

  /******************************************* ENDS *************************************************** */
}