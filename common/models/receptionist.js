'use strict';

const Composer = require('../lib/composer.js');
const app = require('../../server/server');

module.exports = function (receptionist) {


  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find", "createreceptionist","updateclinic"];
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

  /********************************************************* UPDATE CLINIC BY RECEPTIONIST NAME *********************************** */
  receptionist.remoteMethod('updateclinic', {
    http: { path: '/updateclinic', verb: 'put' },
    description: "Update clinic by receptionist",
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },     //receptionist detail,clinicId
    returns: { arg: 'result', type: 'any', root: true }
  });

  receptionist.updateclinic = function (data, cb) {
    console.log('data' + data.receptionist,data.clinicId);
    const clinic = app.models.clinic;
    clinic.findOne({ where: { clinicId: data.clinicId } }, function (err, clinicinfo) {
      console.log('err', err);
      console.log('clinicinfo', clinicinfo);
      if (!err) {
        clinicinfo.updateAttributes({receptionist:data.receptionist} ,function (err, updated) {
          console.log('err', err);
          console.log('updated data', updated);
          cb(null, updated);
        });
      }
    });
  }


  /********************************************************************* ENDS ****************************************************** */
}