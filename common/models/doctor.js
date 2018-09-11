'use strict';

const Composer = require('../lib/composer.js');
const server = require('../../server/server');

module.exports = function (doctor) {
  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "updateProfile", "deleteById"];
  doctor.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      doctor.disableRemoteMethodByName(methodName);
    }
  });

  /****************************** DOCTOR UPDATE API STARTS *********************** */

  doctor.remoteMethod('updateProfile', {
    http: { path: '/profile/:userId', verb: 'put' },
    description:"update doctor profile by userId",
    accepts: [
      { arg: 'userId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'data', type: 'obj',http: { source: 'body' } }
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
};
