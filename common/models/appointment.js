'use strict';

const Composer = require('../lib/composer.js');
const moment = require('moment');
const app = require('../../server/server');

module.exports = function (appointment) {
  const enabledRemoteMethods = ["findById", "deleteById", "find", "bookAppointment", "cancelAppointment", "doctorAppointment", "individualAppointment", "getDoctorEvents"];
  appointment.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      appointment.disableRemoteMethodByName(methodName);
    }
  });

  /************** API FOR BOOK APPOINTMENT***************/
  appointment.remoteMethod('bookAppointment', {
    http: { path: '/bookAppointment', verb: 'post' },
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' },
  })
  appointment.bookAppointment = function (data, cb) {

    var comingDate = moment(data.appointmentDate).format('YYYY-MM-DD');
    console.log(comingDate)

    appointment.findOne({ where: { and: [{ individualId: 'resource:io.mefy.individual.individual#' + data.individualId }, { clinicId: 'resource:io.mefy.doctor.clinic#' + data.clinicId }, { appointmentDate: comingDate }, { doctorId: 'resource:io.mefy.doctor.doctor#' + data.doctorId },{appointmentTimeFrom:data.appointmentTimeFrom},{appointmentTimeTo:data.appointmentTimeTo}] } }, function (err, exists) {
      console.log('data...', exists)
      if (exists != null && Object.keys(exists).length != 0) {
        console.log('BokKed....................appointment')
        let response = {
          error: true,
          message: "Already have An Appointment"
        }
        cb(null, response)
      }
      else {
        console.log('appointment')
        appointment.create({
          doctorId: data.doctorId, individualId: data.individualId, clinicId: data.clinicId, eventName: data.eventName, eventDescription: data.eventDescription, status: data.status, appointmentType: data.appointmentType, appointmentTimeFrom: data.appointmentTimeFrom, appointmentTimeTo: data.appointmentTimeTo, appointmentDate: comingDate,clinicName:data.clinicName
        }, function (err, res) {
          if (err) {
            let errRes = {
              error: true,
              err: err,
              message: "Not Created"
            }
            cb(null, errRes)
          } else {
            console.log('result', res)
            let appointmentCreation = {
              error: false,
              result: res,
              message: "Appointment create successfully"
            }
            cb(null, appointmentCreation);
          }
        })
      }
    })
  }
  /************** END OF API FOR BOOK APPOINTMENT***************/

  /*************** API FOR CANCEL APPOINTMENT*********************/
  appointment.remoteMethod('cancelAppointment', {
    http: { path: '/cancelAppointment', verb: 'post' },
    accepts:  { arg: 'data', type: 'object', required: true, http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' }
  })
  appointment.cancelAppointment = function (data, cb) {
    appointment.findOne({ where: { appointmentId: data.appointmentId } }, function (err, exists) {
      if (err) {
        let errResponse = {
          error: true,
          err: err,
          message: "Sometiong Went Wrong."
        }
        cb(null, errResponse)
      }
      else {
        if (exists != null && Object.keys(exists).length != 0) {
          exists.updateAttribute('status', 'Cancelled', function (err, result) {
            if (err) {
              let x = {
                err: err,
                msg: "Sometiong Went Wrong.."
              }
              cb(null, msg)
            }
            else {
              console.log('resultttt', result)
              let successmessage = {
                error: false,
                result: result,
                message: 'Appointment cancelled Successfully'
              }
              cb(null, successmessage);
            }
          })

        }
        else {
          cb(null, 'data not found')
        }
      }
    })
  }
  /*************** END OF API FOR CANCEL APPOINTMENT*********************/

  /**************** API FOR DOCTOR"S APPOINTMENT LIST BY DATE AND DOCTORID */
  appointment.remoteMethod('doctorAppointment', {
    http: { path: '/doctorAppointmentList', verb: 'get' },
    accepts: [{ arg: 'doctorId', type: 'string' }, { arg: 'appointmentDate', type: 'string' }],
    returns: { arg: 'result', type: 'any' }
  })
  appointment.doctorAppointment = function (doctorId, appointmentDate, cb) {
    appointment.find({ where: { and: [{ doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId }, { appointmentDate: appointmentDate }] } }, function (err, exists) {
      console.log('doctorId', exists)
      if (err) {
        let errMsg = {
          error: true,
          err: err,
          msg: 'Something went wrong',
        }
        cb(null, errMsg)
      } else {
        if (exists != null && Object.keys(exists).length != 0) {
          let successmessage = {
            error: false,
            result: exists,
            message: "Get Doctor's Appoitnment List  for Specific Date Sucessfully"
          }
          cb(null, successmessage)
        }
        else {
          let errormessage = {
            error: false,
            result: exists,
            message:"No Any Appointment"
          }
          cb(null, errormessage)
        }
      }

    })
  }
  /****************  END OF API FOR DOCTOR"S APPOINTMENT LIST BY DATE AND DOCTORID */

  /**************** API FOR Individual's  APPOINTMENT LIST BY DATE AND INDIVIDUALID******************* */
  appointment.remoteMethod('individualAppointment', {
    http: { path: '/individualAppointmentList', verb: 'get' },
    accepts: [{ arg: 'individualId', type: 'string' }, { arg: 'appointmentDate', type: 'string' }],
    returns: { arg: 'result', type: 'any' }
  })
  appointment.individualAppointment = function (individualId, appointmentDate, cb) {
    appointment.find({ where: { and: [{ individualId: 'resource:io.mefy.individual.individual#' + individualId }, { appointmentDate: appointmentDate }] } }, function (err, exists) {
      console.log('individualId', exists)
      if (err) {
        let errMsg = {
          error: true,
          err: err,
          msg: 'Something went wrong',
        }
        cb(null, errMsg)
      } else {
        if (exists != null && Object.keys(exists).length != 0) {
          let successmessage = {
            error: false,
            result: exists,
            message: "Get Individual's Appoitnment List  for Specific Date Sucessfully"
          }
          cb(null, successmessage)
        }
        else {
          cb(null, 'data not found')
        }
      }

    })
  }
  /****************  END OF API FOR INDIVIDUAL'S APPOINTMENT LIST BY DATE AND DOCTORID */
  /********************* API FOR GETTING DOCTOR'S  CURRENT SCHEDULE********************/
  appointment.remoteMethod('getDoctorEvents', {
    http: { path: '/getDoctorEvents', verb: 'get' },
    description: "Get doctor's appoitnment for specific date",
    accepts: { arg: 'doctorId', type: 'string', required: true },
    returns: { arg: 'result', type: 'any' }
  })
  appointment.getDoctorEvents = function (doctorId, cb) {
    // var now = moment(new Date()); //todays date
    var now = moment().format('YYYY-MM-DD');
    console.log('currentDate', now)

    appointment.find({ where: { doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (err, exists) {
      console.log('appointment list',exists);
      console.log('error'+err);
      let appointmentList = []
      if (exists != null && exists.length!= 0) {
        // console.log('exists',exists)
        for (let i = 0; i < exists.length; i++) {
          console.log('length', exists.length)
          if (moment(exists[i].appointmentDate).isSame(now) || moment(exists[i].appointmentDate).isAfter(now)) {
            appointmentList.push(exists[i])
            console.log('apppp', appointmentList)
            // app.models.individual.findOne({where:{individualId:exists[i].individualId}},function(err,indvinfo){

            // })
            var upcomingAppointment = {
              error: false,
              result: appointmentList,
              message: 'Get Upcoming Appontment List'
            }
          }
        }
        if (appointmentList != null && Object.keys(appointmentList).length != 0) {
          cb(null, upcomingAppointment)
        }
        else {
          cb(null, 'No Any Appointment')
        }
      } else {
        cb(null, 'Not Found')
      }
    })
  }
  /****************  END OF API FOR UPCOMING DOCTOR'SAPPOINTMENT LIST *************/




}
