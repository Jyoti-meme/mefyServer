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

  /******************************* ADD CLINIC ******************************************** */
  clinic.remoteMethod('addClinic', {
    http: { path: '/addclinic', verb: 'post' },
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' },
  });

clinic.addClinic = function (data, cb) {
    clinic.find({ where: { doctorId: 'resource:io.mefy.doctor.doctor#' + data.doctorId } }, function (err, list) {
      // console.log('exists', result)
      filterClinic(list, data).then(result => {
        console.log('returned result', result)
        if (result == false) {
          console.log('inside if')
          //clinic create
          clinic.create(
            {
              doctorId: data.doctorId, clinicName: data.clinicName, phoneNumber: data.phoneNumber, city: data.city,
              address: data.address, pin: data.pin, fee: data.fee, weekDays: data.weekDays, bookingStatus: data.bookingStatus,
              availability: data.availability
            }, function (err, res) {
              console.log('eesult', res)
              let cliniccreation = {
                error: false,
                clinic: res,
                message: "clinic create successfully"
              }
              cb(null, cliniccreation);
            })
        } else {
          ///time collapsed
          let collapsedtime = {
            error: false,
            message: 'You had another clinic on this time for same day',
            forDay: result
          }
          cb(null, collapsedtime)
        }

      }).catch(err => {
        let collapsedtime = {
          error: true,
          message: 'something went wrong'

        }
        cb(null, collapsedtime)
      })

    });

  }


  //checking whether same time for same day collapsed
  function filterClinic(clinicList, input) {
    // console.log('filter', clinicList)
    // console.log('input', input)
    return new Promise((resolve, reject) => {

      for (let j = 0; j < clinicList.length; j++) {
        console.log('j:::', clinicList[j]);
        for (let k = 0; k < clinicList[j].weekDays.length; k++) {
          console.log('k:::', clinicList[j].weekDays);
          for (let i = 0; i < input.weekDays.length; i++) {
            console.log('i:::', i);
            if (input.weekDays[i].day === clinicList[j].weekDays[k].day) {
              console.log('day matched', clinicList[j].weekDays[k].day)
              var time = moment(input.weekDays[i].startTime, format);
              var beforeTime = moment(clinicList[j].weekDays[k].startTime, format);
              var afterTime = moment(clinicList[j].weekDays[k].endTime, format);
              // console.log('time', time);
              // console.log('starttime', beforeTime)
              // console.log('endtime', afterTime)
              // console.log('beforeissame:', time.isSame(beforeTime))
              // console.log('afterissame', time.isSame(afterTime))
              // console.log('betwen:', time.isBetween(beforeTime, afterTime))
              if (time.isSame(beforeTime) || time.isSame(afterTime) || time.isBetween(beforeTime, afterTime)) {
                resolve(input.weekDays[i])
                console.log('insideif')

              } else {

                console.log('is not between')
                resolve(false)
              }
            } else {
              resolve(false)
            }
          }


        }
      }
    })

  }

  /************************************** END ***************************************** */


  /*************************************  GET CLINIC BY DOCTOR ID   ********************* */

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

  /**********************************  END  ************************************** */


  /*********************  CLINIC BY DATE AND DOCTORID  *********************************** */

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
    clinic.find({ where: { and: [{ 'doctorId': 'resource:io.mefy.doctor.doctor#' + doctorId }, { 'weekDays.day': { $in: ["Monday"] } }] } }, function (err, res) {
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



  /*********************** UPDATE CLINIC BY CLINICID **********************/
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
  /********************************** END OF CLINIC UPDATE ************************************** */
}


var format = 'hh:mm:ss'

// var time = moment() gives you current time. no format required.
var time = moment('09:34:00', format),
  beforeTime = moment('08:34:00', format),
  afterTime = moment('10:34:00', format);

if (time.isBetween(beforeTime, afterTime)) {

  console.log('is between')

} else {

  console.log('is not between')

}