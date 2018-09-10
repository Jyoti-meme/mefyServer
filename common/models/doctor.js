'use strict';

const Composer = require('../lib/composer.js');
const server = require('../../server/server');

module.exports = function (doctor) {
  // Composer.restrictModelMethods(doctor);

  /**********************************************DOCTOR UPDATE API******************** */

  doctor.remoteMethod('updateProfile', {
    http: { path: '/profile/:userId', verb: 'put' },
    accepts: [
      { arg: 'userId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'data', type: 'obj' }
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
  /******************************************************************************************* */
};
