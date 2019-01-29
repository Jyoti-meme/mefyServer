'use strict';

const Composer = require('../lib/composer.js');
const app = require('../../server/server');

module.exports = function (receptionist) {


  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find", "createreceptionist", "removereceptionist"];
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

  /*********************************************** DOCTOR REMOVE RECEPTIONIST FROM CLINIC ************************************* */
  receptionist.remoteMethod('removereceptionist', {
    http: { path: '/removereceptionist', verb: 'delete' },
    description: "remove receptionist from clinic",
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },     //reception id
    returns: { arg: 'result', type: 'any', root: true }
  });
  receptionist.removereceptionist = function (data, cb) {
    receptionist.destroyById(data.receptionId, function (err, info) {
      console.log('err', err);
      console.log('info', info);
      if (err) {
        let response = {
          error: true,
          message: 'Error in removing Receptionist'
        }
        cb(null, response)
      }
      else {
        let response = {
          error: false,
          message: 'Receptionist removed successfully!'
        }
        cb(null, response)
      }
    })

  }

  /********************************************************* ENDS ************************************************************* */
  /********************************************************* UPDATE CLINIC BY RECEPTIONIST NAME *********************************** */
  // receptionist.remoteMethod('updateclinic', {
  //   http: { path: '/updateclinic', verb: 'put' },
  //   description: "Update clinic by receptionist",
  //   accepts: { arg: 'data', type: 'object', http: { source: 'body' } },     //receptionist detail,clinicId
  //   returns: { arg: 'result', type: 'any', root: true }
  // });

  // receptionist.updateclinic = function (data, cb) {
  //   console.log('data' + data.receptionist,data.clinicId);
  //   const clinic = app.models.clinic;
  //   clinic.findOne({ where: { clinicId: data.clinicId } }, function (err, clinicinfo) {
  //     console.log('err', err);
  //     console.log('clinicinfo', clinicinfo);
  //     if (!err) {
  //       clinicinfo.updateAttributes({receptionist:data.receptionist} ,function (err, updated) {
  //         console.log('err', err);
  //         console.log('updated data', updated);
  //         cb(null, updated);
  //       });
  //     }
  //   });
  // }


  /********************************************************************* ENDS ****************************************************** */
}