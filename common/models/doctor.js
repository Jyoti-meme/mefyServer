'use strict';

const Composer = require('../lib/composer.js');
const app = require('../../server/server');
const specialityList = require('../../speciality.json');
const stateList = require('../../state.json');
const educationList = require('../../education.json');
const languageList = require('../../language.json');
const medicineList = require('../../medicine.json');

module.exports = function (doctor) {
  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "updateProfile", "deleteById", "find", "updateDoctorStatus", "getList", "doctorDashboard","findIndividual","createIndividual"];
  doctor.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      doctor.disableRemoteMethodByName(methodName);
    }
  });

  /****************************** DOCTOR UPDATE API STARTS *********************** */

  doctor.remoteMethod('updateProfile', {
    http: { path: '/profile/:userId', verb: 'put' },
    description: "update doctor profile by userId",
    accepts: [
      { arg: 'userId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'data', type: 'obj', http: { source: 'body' } }
    ],
    returns: { arg: 'result', type: 'string' },
  });

  // UPDATE DOCTOR PROFILE WITH PASSED FIELDS
  doctor.updateProfile = function (userId, data, cb) {
    //check user existence

    doctor.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + userId } }, function (err, exists) {
      console.log('result', exists)
      if (exists != null && Object.keys(exists).length != 0) {
        // update attributes
        exists.updateAttributes(data, function (err, result) {
          console.log('response from update', result);

          let success = {
            error: false,
            result: result,
            message: 'Profile updated Sucessfully'
          }
          cb(null, success);
        })

      }
      else {
        let error = {
          error: true,
          message: 'User not found'
        }
        cb(null, error)
      }
    })
  }
  /************************************ENDS******************************************************* */

  /*************************************AVAILABLE DOCTOR LIST IF ONLINE******************************************* */

  doctor.remoteMethod('onlinedoctors', {
    http: { path: '/onlinedoctors', verb: 'get' },
    description: "get list of all online doctors",
    returns: { arg: 'result', type: 'any' },

  });

  doctor.onlinedoctors = function (cb) {
    //doctor list if availabilty is online and socket is not equal to null
    doctor.find({ where: { and: [{ availability: "Online" }, { socketId: { neq: "" } }] } }, function (err, list) {
      console.log('LIST OF DOCTOR', list);
      let listresponse = {
        error: false,
        result: list,
        message: 'List of online doctors'
      }
      cb(null, listresponse);
    })
  }
  /******************************************************************************************************** */


  /**************************** UPDATE DOCTOR AVAILABILITY *********************/
  doctor.remoteMethod('updateDoctorStatus', {
    http: { path: '/updateDoctorStatus', verb: 'post' },
    accepts: { arg: 'data', type: 'object', required: true, http: { source: 'body' } },
    returns: { arg: 'result', type: 'string' },
  });
  /************************* API LOGIC *************************/
  doctor.updateDoctorStatus = function (data, cb) {
    console.log('user Detail....', data.doctorId, data.socketId, data.availability)


    doctor.findOne({ where: { doctorId: data.doctorId } }, function (err, exists) {
      console.log('existence', exists)
      console.log('error', err)
      if (err) {
        let errormessage = {
          error: true,
          message: "Something Weng Wrong"
        }
        cb(null, errormessage);
      }
      else {
        // if (exists != null && Object.keys(exists).length != 0) {

        exists.updateAttributes({ socketId: data.socketId, availability: data.availability }, function (err, result) {
          console.log('result', result)
          let successmessage = {
            error: false,
            result: data,
            message: 'Doctor Status Updated Successfully'
          }
          cb(null, successmessage);
        })

        // }
      }

    })
  }
  /******************************************** ENDS ****************************************** */

  /*************************************************  VIDEO CALL ACCEPT /REJECT/CALL_END BY INDIVIDUAL *********************************************** */
  doctor.remoteMethod('callactions', {
    http: { path: '/callactions/:individualId/:doctorId/:token', verb: 'get' },
    description: "  accept/reject/callend actions ",
    accepts: [
      { arg: 'actions', type: 'string', required: true },
      { arg: 'individualId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'doctorId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'token', type: 'string', required: true, http: { source: 'path' } },
    ],
    returns: { arg: 'result', type: 'any' }
  });


  doctor.callactions = function (actions, individualId, doctorId, token, cb) {
    console.log('actions:' + actions, 'data:' + token, individualId, doctorId);
    const individual = app.models.individual;
    var socket = app.io;

    individual.findOne({ where: { individualId: individualId } }, function (err, result) {
      if (result != null && Object.keys(result).length != 0) {
        if (actions == 'accept') {
          //acept event emit
          socket.to(result.socketId).emit("accept", {
            doctorId: data.doctorId,
            message: 'Call accepted'
          });
          let response = {
            error: false,
            message: 'Call accepted'
          }
          cb(null, response);
        }
        else if (actions == 'reject') {
          // reject event emit
          socket.to(result.socketId).emit("reject", {
            doctorId: data.doctorId,
            message: 'Call rejected'
          });
          let response = {
            error: false,
            message: 'Call rejected'
          }
          cb(null, response);
        }
        else if (actions == 'call_end') {
          //end call event emit
          socket.to(result.socketId).emit("call_end", {
            doctorId: data.doctorId,
            message: 'Call ended'
          });
          let response = {
            error: false,
            message: 'Call ended'
          }
          cb(null, response);
        }
      }
      else {
        cb(null, 'user doesnot exists')
      }
    });
  }
  /************************************************* ENDS *************************************************** */

  /*************************** GET List OF Specility,State,Language ,Education********************************/
  doctor.remoteMethod('getList', {
    http: { path: '/getList', verb: 'get' },
    accepts: [{ arg: 'speciality', type: 'string' }, { arg: 'state', type: 'string' }, { arg: 'language', type: 'string' }, { arg: 'education', type: 'string' },{ arg: 'medicine', type: 'string' }],
    description: "get list of Specility,State,Language,Education,medicine",
    returns: { arg: 'result', type: 'any' },
  });
  doctor.getList = function (speciality, state, language, education,medicine, cb) {
    console.log('data',language)
    if (speciality || state || language || education || medicine != null && Object.keys(speciality || state || language || education || medicine).length != 0) {
      if (speciality == 'speciality') {
        console.log('specialityyy')
        let specialityResponse = {
          error: false,
          result: specialityList,
          message: 'Getting All List Of Speciality'
        }
        cb(null, specialityResponse);
      }
     else  if (state == 'state') {
        console.log('state')
        let stateResponse = {
          error: false,
          result: stateList,
          message: 'Getting All List Of State'
        }
        cb(null, stateResponse);
      }
      else if (language == 'language') {
        console.log('language')
        let languageResponse = {
          error: false,
          result: languageList,
          message: 'Getting All List Of Language'
        }
        cb(null, languageResponse);
      }
      else if (education == 'education') {
        console.log('education')
        let educationResponse = {
          error: false,
          result: educationList,
          message: 'Getting All List Of Education'
        }
        cb(null, educationResponse);
      }
     else if (medicine == 'medicine') {
        console.log('medicine')
        let medicineResponse = {
          error: false,
          result: medicineList,
          message: 'Getting All List Of medicine'
        }
        cb(null, medicineResponse);
      }
      else {
        cb(null, 'NotFound')
      }
    }

    else {
      cb(null, 'NotFound')
    }
  }
  /************************************************* END*************************************************** */
  /***********************************DOCTOR'S DASHBOARD*************************************/
  doctor.remoteMethod('doctorDashboard', {
    http: { path: '/doctorDashboard', verb: 'get' },
    description: "Doctor's dashboard data",
    accepts: { arg: 'doctorId', type: 'string', required: true },
    returns: { arg: 'result', type: 'any' }
  })
  doctor.doctorDashboard = function (doctorId, cb) {
    const Clinic = app.models.clinic
    const Appointment = app.models.appointment

    Clinic.find({ where: { doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (err, exists) {
      if (exists != null && Object.keys(exists).length != 0) {
        // console.log('number', exists.length)
        var eConsultData = []
        var clinicVisitData = []
        Appointment.find({ where: { doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (er, appointment) {
          if (appointment != null && Object.keys(appointment).length != 0) {
            for (let i = 0; i < appointment.length; i++) {
              if (appointment[i].appointmentType == 'eConsult') {
                eConsultData.push(appointment[i])
                console.log('appppointment', eConsultData.length)
              }
              else {
                clinicVisitData.push(appointment[i])
                console.log('clinicVisitData', clinicVisitData.length)
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
            cb(null, dashboardData)
          } else {
            let Appointmentmsg = {
              error: false,
              message: "Doctor's Dashboard Detail",
              clinic: exists.length,
              credit: 0,
              clincVistPatient: 0,
              eConsultPatient: 0,
            }
            cb(null, Appointmentmsg)
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
        cb(null, clinicmsg)
      }
    })
  }
  /************************************************* END *************************************************** */

  /*****************************************  DOCTOR CREATE INDIVIDUAL ****************************************************** */
  doctor.remoteMethod('createIndividual', {
    http: { path: '/createindividual', verb: 'post' },
    description: "Doctor create individual",
    accepts: { arg: 'data', type: 'obj', required: true, http: { source: 'body' } },  //doctorId,phonenumber,role,name
    returns: { arg: 'result', type: 'any' }
  });

  doctor.createIndividual = function (data, cb) {
    console.log('data', data);
    const User = app.models.User;
    const individual = app.models.individual;
    User.find({where:{ phoneNumber: data.phoneNumber }}, function (err, exists) {
      console.log('exists', exists);
      if (exists.length != 0) {
        // individual created
        let result = {
          error: true,
          message: 'Individual exists'
        }
        cb(null,result)
      }
      else {
        //create user and individual
       
        User.create({
          phoneNumber: data.phoneNumber, role: data.role
        }, function (err, user) {
          console.log('user created', user);
          console.log('errr',err)
          individual.create({ phoneNumber: data.phoneNumber, name: data.name, userId: user.userId }, function (err, indv) {
            console.log('individual', indv)
            console.log('er',err)
            let response={
              err:false,
              result:indv,
              message:'indv created'
            }
            cb(null,response);
          })
        })
      }
    })
  }
  /****************************************************ENDS ******************************************* */
/************************************* DOCTOR FIND INDIVIDUAL ************************************************ */
doctor.remoteMethod('findIndividual', {
  http: { path: '/findindividual', verb: 'get' },
  description: "Doctor create individual",
  accepts: { arg: 'phoneNumber', type: 'string', required: true},  //doctorId,phonenumber,role,name
  returns: { arg: 'result', type: 'any' }
});

doctor.findIndividual=function(phoneNumber,cb){
  console.log('phoneNumber',phoneNumber);
  const individual=app.models.individual;
  individual.findOne({where:{phoneNumber:phoneNumber}},function(err,result){
    console.log('result',result);
    console.log('err',err);
    if(result!==null&& Object.keys(result).length!=0){
      let response={
        error:false,
        result:result,
        message:'User detail'
      }
      cb(null,response);
    }
   else{
     let response={
       error:true,
       message:'user not found'
     }
    cb(null,response);
   }
  })
}

/************************************************* ENDS *********************************************** */
};
