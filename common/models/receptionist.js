'use strict';

const Composer = require('../lib/composer.js');
const app = require('../../server/server');

module.exports = function (receptionist) {


  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find", "createreceptionist", "removereceptionist", "numberChecking", "sendOtp", "login","receptionistDashboard"];
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
    http: { path: '/removereceptionist/:receptionId', verb: 'delete' },
    description: "remove receptionist from clinic",
    accepts: { arg: 'receptionId', type: 'string' ,required:true,http: { source: 'path' }},     //reception id
    returns: { arg: 'result', type: 'any', root: true }
  });
  receptionist.removereceptionist = function (receptionId, cb) {
    console.log(receptionId)
    receptionist.destroyById(receptionId, function (err, info) {
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

  /************************************* CHECK IF PHONENUMBER IS UNIQUE OR NOT ************ */
  receptionist.remoteMethod('numberChecking', {
    http: { path: '/checkNumber', verb: 'post' },
    description: "check whether receptionist number is unique or not",
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },     // phoneNumber
    returns: { arg: 'result', type: 'any', root: true }
  });

  receptionist.numberChecking = function (data, cb) {
    receptionist.find({ where: { phoneNumber: data.phoneNumber } }, function (err, exists) {
      console.log('err', err);
      console.log('exists', exists);
      if (err) {
        let response = {
          error: true,
          message: 'Error occurred'
        }
        cb(null, response);
      }
      else if (exists.length != 0) {
        let response = {
          error: false,
          message: 'PhoneNumber already exists!'
        }
        cb(null, response);
      }
      else {
        let response = {
          error: false,
          message: 'PhoneNumber is unique!'
        }
        cb(null, response);
      }

    })
  }
  /******************************************** ENDS *************************************** */

  /*********************************************** SendOtp ***************************************** */

  receptionist.remoteMethod('sendOtp', {
    http: { path: '/sendOtp', verb: 'post' },
    description: "send otp to receptionist phonenNumber",
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },     // phoneNumber
    returns: { arg: 'result', type: 'any', root: true }
  });

  receptionist.sendOtp = function (data, cb) {
    // console.log(phoneNumber)
    receptionist.findOne({ where: { phoneNumber: data.phoneNumber } }, function (err, exists) {
      console.log('err', err);
      console.log('exists', exists)
      if (err) {
        let response = {
          error: true,
          message: 'Something Happended!'
        }
        cb(null, response);
      }
      else if (exists != null && Object.keys(exists).length != 0) {
        //send otp
        var otpresponse = {
          err: false,
          message: 'OTP sent to registered number'
        }
        cb(null, otpresponse)
        // sendOtptoNumber(data.phoneNumber).then(function (otp) {
        //   console.log('otp',otp)
        //   if (otp.type == 'success') {
        //     var otpresponse = {
        //       err: false,
        //       message: 'OTP sent to registered number'
        //     }
        //     cb(null, otpresponse)
        //   }
        //   else {
        //     var otperror = {
        //       error: true,
        //       message: 'Otp sending falied',
        //       details: result
        //     }
        //     cb(null, otperror)
        //   }
        // }).catch(err => {
        //   cb(null, err)
        // })
      }
      else {
        // number not registeree
        let response = {
          error: true,
          message: 'PhoneNumber doesnot exists!'
        }
        cb(null, response);
      }

    })
  }

  // send otp to number
  function sendOtptoNumber(phoneNumber) {
    return new Promise((resolve, reject) => {
      let url = 'http://control.msg91.com/api/sendotp.php?authkey=236155AYj2f1NozV5b921323&message=%23%23OTP%23%23&sender=MEFYME&mobile=' + phoneNumber + '';
      fetch(url, {
        method: 'GET'
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          resolve(responseJSON)
        })
        .catch((error) => {
          reject(err)
        })
    })
  }
  /************************************************* ENDS ******************************* */

  /***************************************** VERIFY OTP AND LOGIN ********************************** */
  receptionist.remoteMethod('verifyotp', {
    http: { path: '/login', verb: 'post' },
    description: "verify otp ",
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },     // phoneNumber
    returns: { arg: 'result', type: 'any', root: true }
  });

  receptionist.verifyotp = function (data, cb) {
    console.log(data)
    verifyOtp(data.phoneNumber, data.otp).then(function (result) {
      console.log(result);
      if (result) {
        let response = {
          error: false,
          message: 'User loggedIn successfully'
        }
        cb(null, response)
      }
      else {
        let response = {
          error: true,
          message: 'OPt verification failed'
        }
        cb(null, response)
      }
    }).catch(err => {
      cb(null, err)
    })

  }



  function verifyOtp(phoneNumber, otp) {
    console.log('dataaaaa', phoneNumber, otp)
    return new Promise((resolve, reject) => {

      if (otp == "8888") {
        resolve(true)
      }
      else {
        reject(false)
      }
      // let verifyOtpUrl = 'https://control.msg91.com/api/verifyRequestOTP.php?authkey=236155AYj2f1NozV5b921323&mobile=' + phoneNumber + '&otp=' + otp;
      // console.log('verifyOtpUrl', verifyOtpUrl)
      // fetch(verifyOtpUrl, {
      //   method: 'POST'
      // })
      //   .then((response) => response.json())
      //   .then((responseJSON) => {
      //     console.log('url json response', responseJSON)
      //     resolve(responseJSON)
      //   }).catch(err => {
      //     reject(err)
      //   })
      // })
    })
  }


  /********************************************* ENDS ******************************************** */

  /*********************************** RECEPTIONIST DASHBOARD DATA *********************************/
  receptionist.remoteMethod('receptionistDashboard', {
    http: { path: '/receptionistDashboard', verb: 'get' },
    description: "Doctor's dashboard data",
    accepts: [{ arg: 'doctorId', type: 'string', required: true },
    { arg: 'receptionistId', type: 'string', required: true },
    { arg: 'clinicId', type: 'string', required: true }],
    returns: { arg: 'result', type: 'any',root:true }
  })
  receptionist.doctorDashboard = function (doctorId, receptionistId,clinicId, cb) {
    const Clinic = app.models.clinic;
    const Appointment = app.models.appointment;
    var now = moment().format('YYYY-MM-DD');
    console.log('currentDate', now) //Current date
    Clinic.find({ where: { and: [{ doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId }, { receptioinist: 'resource:io.mefy.receptionist.receptionist#' + receptionistId }] } }, function (err, exists) {
      console.log('err'+err,'receptionist'+exists)
      if (exists != null && Object.keys(exists).length != 0) {
        // console.log('number', exists.length)
        var eConsultData = [];
        var clinicVisitData = [];
        Appointment.find({ where:{and:[{ doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId },{clinicId:'resource:io.mefy.clinic.clinic#'+clinicId}]}  }, function (err, appointment) {
          console.log('err'+err,'appointment'+appointment)
          if (appointment != null && Object.keys(appointment).length != 0) {
            for (let i = 0; i < appointment.length; i++) {
              if (appointment[i].appointmentType == 'eConsult' && appointment[i].status == 'Active' && moment(appointment[i].appointmentDate).isSame(now)) {
                eConsultData.push(appointment[i]);
                console.log('appppointment', eConsultData.length);
              }
              else if (appointment[i].appointmentType == 'clinicVisit' && appointment[i].status == 'Active' && moment(appointment[i].appointmentDate).isSame(now)) {
                clinicVisitData.push(appointment[i]);
                console.log('clinicVisitData', clinicVisitData.length);
              }
            }
            let dashboardData = {
              error: false,
              message: "Doctor's Dashboard Detail",
              clinic: exists.length,
              clincVistPatient: clinicVisitData.length,
              eConsultPatient: eConsultData.length,
              credit: 0
            }
            cb(null, dashboardData);
          } else {
            let Appointmentmsg = {
              error: false,
              message: "Doctor's Dashboard Detail",
              clinic: exists.length,
              credit: 0,
              clincVistPatient: 0,
              eConsultPatient: 0,
            }
            cb(null, Appointmentmsg);
          }
        })

      } else {
        let clinicmsg = {
          error: false,
          message: "Doctor's Dashboard Detail",
          clinic: 0,
          credit: 0,
          clincVistPatient: 0,
          eConsultPatient: 0,
        }
        cb(null, clinicmsg);
      }
    })
  }
  /************************************************* END *************************************************** */
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