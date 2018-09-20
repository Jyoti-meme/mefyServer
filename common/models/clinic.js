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

  clinic.addClinic = function (data, cb) {
    clinic.create(
      {
        doctorId: data.doctorId, clinicName: data.clinicName, phoneNumber: data.phoneNumber, city: data.city,
        address: data.address, pin: data.pin, fee: data.fee, weekDays: data.weekDays, bookingStatus: data.bookingStatus,
        availability: data.availability
      }, function (err, res) {
        console.log('eesult', res)
        let result = {
          error: false,
          clinic: res,
          message: "clinic create successfully"
        }
        cb(null, result);
      })

  }
  /******************************* END ***************************************** */
  /***************GET  CLINIC BY DOCTOR ID********************************************** */
  clinic.remoteMethod('getClinicByDoctorId', {
    http: { path: '/clinicByDoctorId/:doctorId', verb: 'get' },
    description: " Get Clinic By DoctorId",
    accepts: { arg: 'doctorId', type: 'string', http: { source: 'path' } },
    returns: { arg: 'result', type: 'string' },
  });

  /*********************** LOGIC************************ */
  clinic.getClinicByDoctorId = function (doctorId, cb) {
    clinic.find({ where: { doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (err, result) {
      console.log('exists', result)
      let doctorClinc = {
        error: false,
        result: result,
        message: "Getting doctor's Clinic list"
      }
      cb(null, doctorClinc)
    })
  }

  /**********************************END************************************** */

  /*********************CLINIC BY DATE AND DOCTORID*********************************** */
  clinic.remoteMethod('clinicByDate', {
    http: { path: '/clinicbydate', verb: 'get' },
    description: " Get Clinic By DoctorId",
    accepts: [{ arg: 'doctorId', type: 'string' }, { arg: 'date', type: 'string' }],
    returns: { arg: 'result', type: 'string' },
  })

  clinic.clinicByDate = function (doctorId, date, cb) {
    var day = moment(date).format('dddd')
    console.log('day', day);
    clinic.find({ where: { 'doctorId': 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (err, res) {
      // console.log('deb', res);
     
      ProcessArray(res,day).then(clinics => {
        console.log('clinic list', clinics)
        cb(null.clinics)
      }).catch(err => {
        console.log('err',err)
        cb(null, err)
      })
    })





    async function ProcessArray(array,day) {
      // console.log('INSIDE PROCESS ARRAY', array)
      console.log('DAY VALUE',day)
      const x = [];
      for (const subs of array) {
        // console.log('substitute data',subs)
        for(const list of subs.weekDays){
          console.log('LISTTTTTT::',list)
          await Promise.all([substitutedata(list.day,day)]).then(function (values) {
            console.log('RETUNED VALUESSSS',values);
            x.push(values[0]);
          });
        }
     
      }
      return x;
    }

    async function substitutedata(item,day) {
      console.log('INSIDE SUBSTITIUE FUNCTION', item+'DAY ALSO'+day)
      return new Promise((resolve,reject) => {
       
        if(item==day){
          console.log('INSIDE IF')
          resolve(item)
        }
        else{
          console.log('INDSIDE ELSE');
        reject(false)
        }
        // clinic.findOne({ where: { individualId: item.individual.split('#')[1] } }, function (err, medicine) {
        //   // console.log('INSIDE MEDICINE FIND METHOD', medicine[0])
        //   console.log('mdecine', medicine)
        //   resolve(medicine);
        // })
      })
    }

  }

  /********************************************************************************** */
}
<<<<<<< HEAD

// standard date format 2018-09-19T14:23:38+05:30
// {where:{and:[{'doctorId':'resource:io.mefy.doctor.doctor#'+doctorId},{"weekDays.day":"Monday"}]}}
// {"weekDays.0.day":{inq:['Monday']}}
=======
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
>>>>>>> 77a9581f505d93df1f85b26425542f5a805c4689
