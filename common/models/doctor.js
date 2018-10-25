'use strict';

const Composer = require('../lib/composer.js');
const server = require('../../server/server');

module.exports = function (doctor) {
  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "updateProfile", "deleteById", "find", "updateDoctorStatus"];
  doctor.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      doctor.disableRemoteMethodByName(methodName);
    }
  });

  /****************************** DOCTOR UPDATE API STARTS *********************** */

  doctor.remoteMethod('updateProfile', {
    http: { path: '/profile/:userId', verb: 'put' },
    description: "update doctor profile by userId",
    accepts: [
      { arg: 'userId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'data', type: 'obj', http: { source: 'body' } }
    ],
    returns: { arg: 'result', type: 'string' },
  });

  // UPDATE DOCTOR PROFILE WITH PASSED FIELDS
  doctor.updateProfile = function (userId, data, cb) {
    //check user existence

    doctor.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + userId } }, function (err, exists) {
      console.log('result', exists)
      if (exists != null && Object.keys(exists).length != 0) {
        // update attributes
        exists.updateAttributes(data, function (err, result) {
          console.log('response from update', result);

          let success = {
            error: false,
            result: result,
            message: 'Profile updated Sucessfully'
          }
          cb(null, success);
        })

      }
      else {
        let error = {
          error: true,
          message: 'User not found'
        }
        cb(null, error)
      }
    })
  }
  /************************************ENDS******************************************************* */

  /*************************************AVAILABLE DOCTOR LIST IF ONLINE******************************************* */

  doctor.remoteMethod('onlinedoctors', {
    http: { path: '/onlinedoctors', verb: 'get' },
    description: "get list of all online doctors",
    returns: { arg: 'result', type: 'any' },

  });

  doctor.onlinedoctors = function (cb) {
    //doctor list if availabilty is online and socket is not equal to null
    doctor.find({ where: { and: [{ availability: "Online" }, { socketId: { neq: "" } }] } }, function (err, list) {
      console.log('LIST OF DOCTOR', list);
      let listresponse = {
        error: false,
        result: list,
        message: 'List of online doctors'
      }
      cb(null, listresponse);
    })
  }
  /******************************************************************************************************** */


  /**************************** UPDATE DOCTOR AVAILABILITY *********************/
  doctor.remoteMethod('updateDoctorStatus', {
    http: { path: '/updateDoctorStatus', verb: 'post' },
    accepts: { arg: 'data', type: 'object', required: true, http: { source: 'body' } },
    returns: { arg: 'result', type: 'string' },
  });
  /************************* API LOGIC *************************/
  doctor.updateDoctorStatus = function (data, cb) {
    console.log('user Detail....', data.doctorId, data.socketId, data.availability)


    doctor.findOne({ where: { doctorId: data.doctorId } }, function (err, exists) {
      console.log('existence', exists)
      console.log('error',err)
      if (err) {
        let errormessage = {
          error: true,
          message: "Something Weng Wrong"
        }
        cb(null, errormessage);
      }
      else {
        // if (exists != null && Object.keys(exists).length != 0) {

          exists.updateAttributes({ socketId: data.socketId, availability: data.availability }, function (err, result) {
            console.log('result', result)
            let successmessage = {
              error: false,
              result: data,
              message: 'Doctor Status Updated Successfully'
            }
            cb(null, successmessage);
          })

        // }
      }

    })
  }
/******************************************** ENDS ****************************************** */
};
