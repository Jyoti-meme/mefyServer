'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(clinic) {
  const enabledRemoteMethods = ["findById", "deleteById","find","addClinic","getClinicByDoctorId"];
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
      { data}, function (err, res) {
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
    http: { path: '/getClinicByDoctorId/:doctorId', verb: 'get' },
    accepts: { arg: 'doctorId', type: 'string',required:true, http: { source: 'body' }},
    returns: { arg: 'result', type: 'string' },
  });

  clinic.getClinicByDoctorId=function(doctorId,cb){
    console.log('doctor',doctorId)
   
  }
}
  /************************************************************************ */
