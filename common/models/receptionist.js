'use strict';

const Composer = require('../lib/composer.js');
const app = require('../../server/server');

module.exports = function (receptionist) {


    // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find", "createreceptionist"];
  receptionist.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
        receptionist.disableRemoteMethodByName(methodName);
    }
  });




/***************************************************** DOCTOR CREATE RECEPTIONIST ******************************************* */
receptionist.remoteMethod('createreceptionist', {
    http: { path: '/create', verb: 'post' },
    description: "Doctor create receptionist",
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },     //doctorId,phonenumber,name,clinicId
    returns: { arg: 'result', type: 'any', root: true }
  });

  receptionist.createreceptionist = function (data, cb) {
    console.log('data', data);
    receptionist.create({
      name: data.name, phoneNumber: data.phoneNumber, doctorId: data.doctorId, clinicId: data.clinicId
    }, function (err, res) {
      console.log('err', err);
      console.log('response', res);
      if (err) {
        let result = {
          error: true,
          message: 'Receptionist creation failed'
        }
        cb(null, result);
      }
      else {
        let result = {
          error: false,
          result: res,
          message: 'Doctor added receptionist'
        }
        cb(null, result);
      }
    })
  }


  /*************************************************************** ENDS ********************************************************* */


}