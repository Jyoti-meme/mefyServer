'use strict';

const Composer = require('../lib/composer.js');

module.exports = function(clinic) {
  const enabledRemoteMethods = ["findById", "create", "deleteById","find","addClinic"];
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
        availability:data.availability
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
};
