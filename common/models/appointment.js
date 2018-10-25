'use strict';

const Composer = require('../lib/composer.js');
const moment = require('moment');

module.exports = function (appointment) {
  const enabledRemoteMethods = ["findById", "deleteById", "find", "bookAppointment", "cancelAppointment", "doctorAppointment", "individualAppointment"];
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
    console.log('dataaaaaaa',data)
    appointment.findOne({ where: { and: [{ individualId: 'resource:io.mefy.individual.individual#' + data.individualId }, { appointmentDate: data.appointmentDate },{ clinicId: 'resource:io.mefy.doctor.clinic#'+data.clinicId }, { doctorId: 'resource:io.mefy.doctor.doctor#' + data.doctorId }] } }, function (err, exists) {
      console.log('data...', exists)
      if (exists != null && Object.keys(exists).length != 0) {
        console.log('BokKed....................appointment')
        let response = {
          error: true,
          message: "Alredy have An Appointment"
        }
        cb(null, response)
      }
      else {
        console.log('appointment')
        appointment.create({
          doctorId: data.doctorId, individualId: data.individualId, clinicId: data.clinicId, eventName: data.eventName, eventDescription: data.eventDescription, status: data.status, appointmentType: data.appointmentType, appointmentTimeFrom: data.appointmentTimeFrom, appointmentTimeTo: data.appointmentTimeTo, appointmentDate: data.appointmentDate
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
    accepts: { arg: 'appointmentId', type: 'string' },
    returns: { arg: 'result', type: 'any' }
  })
  appointment.cancelAppointment = function (appointmentId, cb) {
    appointment.findOne({ where: { appointmentId: appointmentId } }, function (err, exists) {
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
          cb(null, 'data not found')
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




}
