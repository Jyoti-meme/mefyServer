'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(clinic) {
  const enabledRemoteMethods = ["findById", "deleteById","find","addClinic","getClinicByDoctorId","updateClinic"];
  clinic.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      clinic.disableRemoteMethodByName(methodName);
    }
  });

  /***************ADD CLINIC********************************************** */
  clinic.remoteMethod('addClinic', {
    http: { path: '/addclinic', verb: 'post' },
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' },
  });

 clinic.addClinic=function(data,cb){
    clinic.create(
      { doctorId:data.doctorId,clinicName:data.clinicName,phoneNumber:data.phoneNumber,city:data.city,
        address:data.address,pin:data.pin,fee:data.fee,weekDays:data.weekDays,bookingStatus:data.bookingStatus,
        availability:data.availability,
      }, function (err, res) {
        console.log('eesult',res)
        let result={
          error:false,
          clinic:res,
          message:"clinic create successfully"
        }
        cb(null,result);
      })
   
  }
  /************************************************************************ */
   /***************GET  CLINIC BY DOCTOR ID********************************************** */
   clinic.remoteMethod('getClinicByDoctorId', {
    http: { path: '/clinicByDoctorId/:doctorId', verb: 'get' },
    description: " Get Clinic By DoctorId",
    accepts: { arg: 'doctorId', type: 'string', http: { source: 'path' }},
    returns: { arg: 'result', type: 'string' },
  });

  /*********************** LOGIC************************ */
  clinic.getClinicByDoctorId = function(doctorId,cb){
    clinic.find({ where:  { doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (err, result){
      console.log('exists',result)
      let doctorClinc = {
        error: false,
        result: result,
        message: "Getting doctor's Clinic list"
      }
      cb(null, doctorClinc)
  })
}
  /**********************************END OF CLINIC LIST************************************** */
/*********************** UPDATE CLINIC BY CLINICID**********************/
  clinic.remoteMethod('updateClinic', {
    http: { path: '/updateClinic/:clinicId', verb: 'put' },
    description: "update clinic  by clinicId",
    accepts: [
      { arg: 'clinicId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'data', type: 'obj', http: { source: 'body' } }
    ],
    returns: { arg: 'result', type: 'string' },
  });
  clinic.updateClinic = function (clinicId, data, cb) {
    clinic.findOne({ where: { clinicId:clinicId } }, function (err, exists) {
      console.log('result', exists)
      if (exists != null && Object.keys(exists).length != 0) {
        // update attributes
        exists.updateAttributes(data, function (err, result) {
          console.log('response from update', result);

          let success = {
            error: false,
            result: result,
            message: 'Clinic updated Sucessfully'
          }
          cb(null, success);
        })

      }
      else {
        let error = {
          error: true,
          message: 'Clinic not found'
        }
        cb(null, error)
      }
    })
  }
  /**********************************END OF CLINIC UPDATE************************************** */
}
