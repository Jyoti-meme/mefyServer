'use strict';

const Composer = require('../lib/composer.js');
const server = require('../../server/server');
const specialityList = require('../../speciality.json');
const stateList = require('../../state.json');
const educationList = require('../../education.json');
const languageList = require('../../language.json');

module.exports = function (doctor) {
  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "updateProfile", "deleteById", "find", "updateDoctorStatus", "getList"];
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
      console.log('error', err)
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

  /*************************************************  VIDEO CALL ACCEPT /REJECT/CALL_END BY INDIVIDUAL *********************************************** */
  doctor.remoteMethod('callactions', {
    http: { path: '/callactions/:individualId/:doctorId/:token', verb: 'get' },
    description: "  accept/reject/callend actions ",
    accepts: [
      { arg: 'actions', type: 'string', required: true },
      { arg: 'individualId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'doctorId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'token', type: 'string', required: true, http: { source: 'path' } },
    ],
    returns: { arg: 'result', type: 'any' }
  });


  doctor.callactions = function (actions, individualId, doctorId, token, cb) {
    console.log('actions:' + actions, 'data:' + token, individualId, doctorId);
    const individual = app.models.individual;
    var socket = app.io;

    individual.findOne({ where: { individualId: individualId } }, function (err, result) {
      if (result != null && Object.keys(result).length != 0) {
        if (actions == 'accept') {
          //acept event emit
          socket.to(result.socketId).emit("accept", {
            doctorId: data.doctorId,
            message: 'Call accepted'
          });
          let response = {
            error: false,
            message: 'Call accepted'
          }
          cb(null, response);
        }
        else if (actions == 'reject') {
          // reject event emit
          socket.to(result.socketId).emit("reject", {
            doctorId: data.doctorId,
            message: 'Call rejected'
          });
          let response = {
            error: false,
            message: 'Call rejected'
          }
          cb(null, response);
        }
        else if (actions == 'call_end') {
          //end call event emit
          socket.to(result.socketId).emit("call_end", {
            doctorId: data.doctorId,
            message: 'Call ended'
          });
          let response = {
            error: false,
            message: 'Call ended'
          }
          cb(null, response);
        }
      }
      else {
        cb(null, 'user doesnot exists')
      }
    });
  }
  /************************************************* ENDS *************************************************** */
  /*************************** GET List OF Specility,State,Language ,Education********************************/
  doctor.remoteMethod('getList', {
    http: { path: '/getList', verb: 'get' },
    accepts: [{ arg: 'speciality', type: 'string' }, { arg: 'state', type: 'string' }, { arg: 'language', type: 'string' }, { arg: 'education', type: 'string' }],
    description: "get list of Specility,State,Language,Education",
    returns: { arg: 'result', type: 'any' },
  });
  doctor.getList = function (speciality, state, language, education, cb) {
    if (speciality || state || language || education != null && Object.keys(speciality || state || language || education).length != 0) {
      if (speciality == 'speciality') {
        console.log('specialityyy')
        let specialityResponse = {
          error: false,
          result: specialityList,
          message: 'Getting All List Of Speciality'
        }
        cb(null, specialityResponse);
      }
      if (state == 'state') {
        console.log('state')
        let stateResponse = {
          error: false,
          result: stateList,
          message: 'Getting All List Of State'
        }
        cb(null, stateResponse);
      }
      if (language == 'language') {
        console.log('language')
        let languageResponse = {
          error: false,
          result: languageList,
          message: 'Getting All List Of Language'
        }
        cb(null, languageResponse);
      }
      if (education == 'education') {
        console.log('education')
        let educationResponse = {
          error: false,
          result: educationList,
          message: 'Getting All List Of Education'
        }
        cb(null, educationResponse);
      }
      else {
        cb(null, 'NotFound')
      }
    }

    else {
      cb(null, 'NotFound')
    }
  }
  /************************************************* ENDS *************************************************** */

};
