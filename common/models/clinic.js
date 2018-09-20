'use strict';

const Composer = require('../lib/composer.js');
const moment = require('moment');

module.exports = function (clinic) {
  const enabledRemoteMethods = ["findById", "deleteById", "find", "addClinic", "getClinicByDoctorId", "updateClinic", "clinicByDate"];
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

  //logic for filtration
  clinic.clinicByDate = function (doctorId, date, cb) {
    var day = moment(date).format('dddd')
    console.log('day', day);
    clinic.find({ where: { 'doctorId': 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (err, res) {
      console.log('Response from find', res);
      var returnResult = filterClinics(res, day)
      let sucessResponse = {
        eror: false,
        clinic: returnResult[0],
        message: "clinic fetched according to date"
      }
      cb(null, sucessResponse)


    })
  }

//create new array of filtered result
  function filterClinics(arr, day) {
    let newarray = [];
    var result = filterViaDay(arr, day)
    // console.log('NRE RESULT',result)
    newarray.push(result);
    return newarray
  }

// filter by day
  function filterViaDay(arr, day) {
    return arr.filter((obj) => {
      for (let i = 0, length = obj.weekDays.length; i < length; i++) {
        if (obj.weekDays[i].day === day) {
          console.log('ARRAY FILTER INSIDE IF')
          return obj;
        }
      }
      return false;
    });
  }



  // standard date format 2018-09-19T14:23:38+05:30
  // {where:{and:[{'doctorId':'resource:io.mefy.doctor.doctor#'+doctorId},{"weekDays.day":"Monday"}]}}
  // {"weekDays.0.day":{inq:['Monday']}}

  /************************************  END  ********************************************** */



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
    clinic.findOne({ where: { clinicId: clinicId } }, function (err, exists) {
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
