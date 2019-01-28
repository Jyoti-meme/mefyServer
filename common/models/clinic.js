'use strict';

const Composer = require('../lib/composer.js');
const moment = require('moment');
const app = require('../../server/server');

module.exports = function (clinic) {
  const enabledRemoteMethods = ["findById", "deleteById", "find", "addClinic", "getClinicByDoctorId", "updateClinic", "clinicByDate", "getClinicSlot"];
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
      console.log('exists', list)
      if (list.length == 0) {
        clinic.create(
          {
            doctorId: data.doctorId, type: data.type, clinicName: data.clinicName, phoneNumber: data.phoneNumber, city: data.city,
            address: data.address, pin: data.pin, fee: data.fee, weekDays: data.weekDays, bookingStatus: data.bookingStatus,
            availability: data.availability
          }, function (err, res) {
            console.log('eesult', res, err)
            if (!err) {
              let cliniccreation = {
                error: false,
                clinic: res,
                message: "Clinic Created Successfully"
              }
              cb(null, cliniccreation);
            }
            else {
              let error = {
                error: true,
                message: err.message

              }
              cb(null, error)
            }

          })
      }
      else {
        filterClinic(list, data).then(result => {
          console.log('returned result', result)
          if (result == false) {
            console.log('inside if')
            //clinic create
            clinic.create(
              {
                doctorId: data.doctorId, type: data.type, clinicName: data.clinicName, phoneNumber: data.phoneNumber, city: data.city,
                address: data.address, fee: data.fee, weekDays: data.weekDays, bookingStatus: data.bookingStatus,
                availability: data.availability
              }, function (err, res) {
                console.log('reesult', res)
                if (!err) {
                  let cliniccreation = {
                    error: false,
                    clinic: res,
                    message: "Clinic Created Successfully"
                  }
                  cb(null, cliniccreation);
                }
                else {
                  let error = {
                    error: true,
                    message: err.message

                  }
                  cb(null, error)
                }
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
      }


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
              var format = 'hh:mm:ss';
              var time = moment(input.weekDays[i].startTime, format);
              var beforeTime = moment(clinicList[j].weekDays[k].startTime, format);
              var afterTime = moment(clinicList[j].weekDays[k].endTime, format);
              // console.log('time', time);
              // console.log('starttime', beforeTime)
              // console.log('endtime', afterTime)
              // console.log('jkkjk')
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


  /*********************  CLINIC BY DATE ,TYPE AND DOCTORID  *********************************** */

  clinic.remoteMethod('clinicByDate', {
    http: { path: '/clinicbydate', verb: 'get' },
    description: " Get Clinic By DoctorId",
    accepts: [{ arg: 'doctorId', type: 'string' }, { arg: 'date', type: 'string' }, { arg: 'type', type: 'string' }],
    returns: { arg: 'result', type: 'string' },
  })

  //logic for filtration
  clinic.clinicByDate = function (doctorId, date, type, cb) {
    console.log('date', date)
    var day = moment(date).format('dddd');
    console.log('day', day);
    if (type == 'clinicVisit') {
      console.log('type', type)
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
    else {
      let x = []
      clinic.find({ where: { 'doctorId': 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (err, res) {
        for (let i = 0; i < res.length; i++) {
          if (res[i].type == "virtual") {
            x.push(res[i])
          }
        }
        console.log('Response from find', x);
        var returnResult = filterClinics(x, day)
        let sucessResponse = {
          eror: false,
          clinic: returnResult[0],
          message: "clinic fetched according to date"
        }
        cb(null, sucessResponse)


      })
    }
  }

  //create new array of filtered result
  function filterClinics(arr, day) {
    console.log('aaaaa', arr, day)
    let newarray = [];
    var result = filterViaDay(arr, day)
    // console.log('NRE RESULT',result)
    newarray.push(result);
    return newarray
  }

  // filter by day
  function filterViaDay(arr, day) {
    console.log('bbbb', arr, day)

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
  /**********************************END OF CLINIC UPDATE************************************** */


  /*********************** Get Specific clinic's available slots for a day**********************/
  clinic.remoteMethod('getClinicSlot', {
    http: { path: '/getTimeSlot', verb: 'get' },
    description: "Get Specific clinic's available slots for a day",
    accepts: [
      { arg: 'clinicId', type: 'string' },
      { arg: 'date', type: 'string' }
    ],
    returns: { arg: 'result', type: 'string' },
  });

  clinic.getClinicSlot = function (clinicId, date, cb) {
    var day = moment(date).format('dddd')
    console.log('day', day);
    clinic.findOne({ where: { clinicId: clinicId } }, function (err, result) {
      console.log('result....', result)
      console.log('err.....', err)
      if (result != null && Object.keys(result).length != 0) {

        let duration = result.weekDays;
        weekdays(duration, clinicId, day).then(response => {
          console.log('WEEKDAYS RETURN VALUE', response)
          // main array shoul be returned here
          let success = {
            error: false,
            response,
            message: 'Get Clinic slot Sucessfully'
          }
          cb(null, success)
        });

      }
      else {
        cb(null, 'data not found')
      }

    })
  }


  // function for weekdays
  async function weekdays(duration, clinicId, day) {
    var slot = [];
    for (const instance of duration) {
      console.log('index of', duration.indexOf(instance))
      await Promise.all([slotdivide(instance, day, clinicId)]).then(function (values) {
        console.log('SLOT DIVIDE RETURNED VALUES', values[0])
        var x = 'slot';
        // concat(duration.indexOf(instance) + 1);
        let a = {
          [x]: values[0]
        }
        slot.push(a)
      }).catch(err => {
        console.log('error::::', err)
      })

    }
    return slot
  }

  async function slotdivide(instance, day, clinicId) {
    // console.log('instance', instance)
    var newarray = [];
    return new Promise((resolve, reject) => {
      if (instance.day == day) {

        let startMinutes = moment.duration(instance.startTime).asMinutes();
        let endMinutes = moment.duration(instance.endTime).asMinutes();
        let timediff = (endMinutes - startMinutes) / 10;

        let timeArray = [];

        var sTime;

        for (let i = 0; i < timediff; i++) {
          // console.log('dataaa::' + i)
          let hr = Math.floor(startMinutes / 60);
          let min = Math.floor(startMinutes % 60);
          let schTime;
          schTime = (hr < 10 ? '0' + hr : hr) + ':' + (min < 10 ? '0' + min : min);
          startMinutes = startMinutes + 10;

          //              
          //logic for dividing time slot
          if (i != 0) {
            let newtime = {
              sTime: sTime,
              eTime: schTime
              // status: 'NotBooked'
            }
            timeArray.push(newtime);
            sTime = schTime;
          } else {
            sTime = schTime;
          }

        }
        // change the status of clinic slot booking basrd on appointmnet bokked for that clinic
        appointmentChecking(timeArray, clinicId).then(list => {
          console.log('list of appoitnment checking:', list);
          var x = 'slot'
          // .concat((i + 1).toString());
          let a = {
            [x]: list
          }
          newarray.push(a);
          resolve(list);
          // let success = {
          //   error: false,
          //   timeSlot1: slot,
          //   message: 'Get Clinic slot Sucessfully'
          // }
          // cb(null, success)
        });

      }

      else {
        reject('error')
      }
    })

  }

  async function appointmentChecking(timeArray, clinicId) {
    console.log('inside functio');
    let y = [];
    for (const subs of timeArray) {
      // console.log('substitute data', subs)
      await Promise.all([substitutedata(subs, clinicId)]).then(function (values) {
        // console.log('RETUNED VALUESSSS', values);
        if (values[0] == false) {
          let x = {
            sTime: subs.sTime,
            eTime: subs.eTime,
            status: 'UnBooked'
          }
          y.push(x);
        }
        else if (values[0] == true) {
          let x = {
            sTime: subs.sTime,
            eTime: subs.eTime,
            status: 'Booked'
          }
          y.push(x);
        }
      }).catch(err => {
        console.log('error 458', err)
      })
    }
    // console.log('ARRAY PUSHED METHOD', y)
    return y;
  }

  async function substitutedata(item, clinicId) {
    // console.log('INSIDE SUBSTITIUE FUNCTION', item);
    const appointment = app.models.appointment;
    return new Promise((resolve) => {
      appointment.findOne({ where: { and: [{ clinicId: 'resource:io.mefy.doctor.clinic#' + clinicId }, { appointmentTimeFrom: item.sTime }, { appointmentTimeTo: item.eTime }] } }, function (err, result) {
        // console.log('appointment checking result', result);
        if (result == null) {
          // if app not booked
          resolve(false)
        } else {
          // if app booked
          resolve(true)
        }
      })
    })
  }
  // /*********************** END OF API Specific clinic's available slots for a day**********************/


  /****************************************** RECEPTIONIST NAME ************************************************ */
  clinic.observe('loaded', function (context, next) {
    const receptionist = app.models.receptionist;
  console.log('contextdata',context.data);
  
    if (context.data.receptionist) {
      console.log('inside if');
     
      receptionist.findOne({ where: { receptionId: context.data.receptionist.split('#')[1] } }, function (err, result) {
        console.log('err', err);
        console.log('result', result);
        if (!err) {
          context.data.receptionist = result;
          // delete context.data['receptionist'];
          next();
        }
        else {
          context.data.receptionist = null;
          // delete context.data['receptionist'];
          next();
        }
      });
    }
    else {
      next();
    }
  })
  /***************************************************** ENDS ************************************************* */
}


