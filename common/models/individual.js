'use strict';

const Composer = require('../lib/composer.js');
const app = require('../../server/server');

module.exports = function (individual) {

  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "updateProfile", "deleteById", "find", "filterdoctor", 'callinitiation', "callactions", "getallergies"];
  individual.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      individual.disableRemoteMethodByName(methodName);
    }
  });

  /*********************UPDATE INDIVIDUAL STARTS ****************************** */

  individual.remoteMethod('updateProfile', {
    http: { path: '/profile/:userId', verb: 'put' },
    description: "update individual profile by userId",
    accepts: [
      { arg: 'userId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'data', type: 'obj', http: { source: 'body' } }
    ],
    returns: { arg: 'result', type: 'string' },
  });


  // UPDATE INDIVIDUAL PROFILE WITH PASSED FIELDS
  individual.updateProfile = function (userId, data, cb) {
    //check user existence
    individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + userId } }, function (err, exists) {
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

  /********************************ENDS ************************************ */


  /********************************* CREATE FAMILY MEMBER STARTS *************************************** */

  individual.remoteMethod('addFamily', {
    http: { path: '/addfamily/:userId', verb: 'put' },
    description: "add family members",
    accepts: [
      { arg: 'userId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'data', type: 'obj', http: { source: 'body' } }
    ],
    returns: { arg: 'result', type: 'string' },
  });

  individual.addFamily = function (userId, data, cb) {
    let famarray = [];
    individual.create(
      { name: data.name, phoneNumber: data.phoneNumber, dob: data.dob, gender: data.gender, city: data.city }, function (err, res) {
        console.log('created individual data', res)

        individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + userId } }, function (err, exists) {
          console.log('exists', exists);
          if (exists != null && Object.keys(exists).length != 0) {
            let datas = {
              relation: data.relation,
              individual: res.individualId
            }
            exists.family.push(datas);
            console.log('data to be updated', famarray)
            exists.updateAttribute('family', exists.family, function (err, result) {
              console.log('result', result)
              let successmessage = {
                error: false,
                result: result,
                message: 'Family member added Successfully'
              }
              cb(null, successmessage);
            })
          }
          else {
            let errormessage = {
              error: true,
              message: "User not found"
            }
            cb(null, errormessage);
          }
        })

      })
  }

  /******************************************* ENDS *************************************** */

  /********************GET INDIVIDUAL DETAILS BASED ON ID FROM FAMILY ****************** */

  individual.remoteMethod('getfamily', {
    http: { path: '/getfamily', verb: 'get' },
    description: "add family members",
    accepts: { arg: 'userId', type: 'string' },
    returns: { arg: 'result', type: 'any' },
  });


  individual.getfamily = function (userId, cb) {
    console.log(userId);
    individual.find({ include: "userId" }, function (err, res) {
      // console.log('response',res)
      cb(null, res);
    })
    // individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + userId } }, function (err, user) {
    //   if (user != null && Object.keys(user).length != 0) {
    //     ProcessArray(user.family).then(users => {
    //       let result = {
    //         error: false,
    //         family: users,
    //         message: 'family member get successfull'
    //       }
    //       cb(null, result)
    //     })
    //       .catch(err => {
    //         let errors = {
    //           error: true,
    //           message: 'Error in fetching data'
    //         }
    //         cb(null, errors);
    //       })
    //   } else {
    //     let errors = {
    //       error: true,
    //       message: 'Error in fetching data'
    //     }
    //     cb(null, errors);
    //   }
    // })
  }


  async function ProcessArray(array) {
    // console.log('INSIDE PROCESS ARRAY', array)
    const x = [];
    for (const subs of array) {
      // console.log('substitute data',subs)
      await Promise.all([substitutedata(subs)]).then(function (values) {
        // console.log('RETUNED VALUESSSS',values);
        x.push(values[0]);
      });
    }
    return x;
  }

  async function substitutedata(item) {
    // console.log('INSIDE SUBSTITIUE FUNCTION', item)
    return new Promise((resolve) => {
      individual.findOne({ where: { individualId: item.individual.split('#')[1] } }, function (err, medicine) {
        // console.log('INSIDE MEDICINE FIND METHOD', medicine[0])
        console.log('mdecine', medicine)
        resolve(medicine);
      })
    })
  }

  /*************************************** ENDS ********************************************** */

  /*********************************** SEARCH DOCTOR ON THE BASIS OF NAME,SPECIALITY,ONLINE ***************************** */

  individual.remoteMethod('filterdoctor', {
    http: { path: '/filterdoctor', verb: 'get' },
    description: "filter doctor on the basis of name,speciality,online/offline",
    accepts: [
      { arg: 'name', type: 'string', required: false },
      { arg: 'speciality', type: 'string', required: false },
      { arg: 'availability', type: 'string', required: false }
    ],
    returns: { arg: 'result', type: 'any' },
  });

  // logic implementation
  individual.filterdoctor = function (name, speciality, availability, cb) {
    console.log('name:' + name, 'speciality:' + speciality, 'availability' + availability);
    const Doctor = app.models.doctor;
    if (name != undefined && availability == undefined && speciality == undefined) {
      // search docotor by name  
      // like not working
      Doctor.find({ where: { name: name } }, function (err, list) {
        console.log('name  filter', list);
        console.log('error', err)
        let result = {
          error: false,
          result: list,
          message: 'List get successfully'
        }
        cb(null, result);
      })
    }
    else if (name == undefined && availability != undefined && speciality == undefined) {
      // search online doctors
      Doctor.find({ where: { availability: 'Online' } }, function (err, list) {
        console.log('online  filter', list);
        console.log('error', err)
        let result = {
          error: false,
          result: list,
          message: 'List get successfully'
        }
        cb(null, result);
      })
    }
    else if (name == undefined && availability == undefined && speciality != undefined) {
      // search doctor by speciality
      //  inq not working  
      Doctor.find({ where: { speciality: { inq: [speciality] } } }, function (err, list) {
        console.log('speciality  filter', list);
        console.log('error', err)
        let result = {
          error: false,
          result: list,
          message: 'List get successfully'
        }
        cb(null, result);
      })
    }
    else if (name != undefined && availability != undefined && speciality == undefined) {
      //    //search doctor by availability and name 
      Doctor.find({ where: { and: [{ availability: 'Online' }, { name: name }] } }, function (err, list) {
        console.log('availabilty and name', list);
        console.log('error', err);
        let result = {
          error: false,
          result: list,
          message: 'List get successfully'
        }
        cb(null, result);
      })
    }
    //  else if(){
    //   //  search by availability  and  specilaity
    //  }
    //  else if(){
    //    //serach by name  and speciality
    //  }
    //  else if(){
    //    // search by all name,availabilty and specility
    //  }


  }
  /******************************************** ENDS ********************************************************************** */


  /********************************************* INDVIDUAL INITIATES VIDEO CALL ********************************************* */

  individual.remoteMethod('callinitiation', {
    http: { path: '/callinitiation', verb: 'post' },
    description: " video call initiation api ",
    accepts:
      // { arg: 'doctorId', type: 'string', required: false },
      // { arg: 'individualId', type: 'string', required: false },
      // { arg: 'token', type: 'string', required: false },
      { arg: 'data', type: 'obj', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' }
  });

  individual.callinitiation = function (data, cb) {
    console.log('data captured', data.doctorId, data.individualId, data.token);
    const doctor = app.models.doctor;
    doctor.findOne({ where: { and: [{ doctorId: data.doctorId }, { availability: 'Online' }] } }, function (err, result) {
      console.log('error:::' + err, 'result:::' + result);
      if (result != null && Object.keys(result).length != 0) {
        //doctor is online emit socket event
        var socket = app.io;
        socket.to(result.socketId).emit("call", {
          individualId: data.individualId,
          token: data.token
        });
        let response = {
          error: false,
          message: 'Call initiated'
        }
        cb(null, response);
      }
      else {
        //doctor is offline
        let response = {
          error: true,
          message: 'User is busy on another call'
        }
        cb(null, response);
      }
    })
  }

  /***************************************************** ENDS ********************************************* */

  /*************************************************  VIDEO CALL ACCEPT /REJECT/CALL_END BY INDIVIDUAL *********************************************** */
  individual.remoteMethod('callactions', {
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


  individual.callactions = function (actions, individualId, doctorId, token, cb) {
    console.log('actions:' + actions, 'data:' + token, individualId, doctorId);
    const doctor = app.models.doctor;
    var socket = app.io;

    doctor.findOne({ where: { doctorId: doctorId } }, function (err, result) {
      if (result != null && Object.keys(result).length != 0) {
        if (actions == 'accept') {
          //acept event emit
          socket.to(result.socketId).emit("accept", {
            individualId: data.individualId,
            message: 'Call accepted',

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
            individualId: data.individualId,
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
            individualId: data.individualId,
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
    })

  }
  /************************************************* ENDS *************************************************** */



  /********************************************** GET INDV ALLERGIES LIST *******************************************/

  individual.remoteMethod('getallergies', {
    http: { path: '/allergy', verb: 'get' },
    accepts: [
      { arg: 'individualId', type: 'string', required: true }
    ],
    returns: { arg: 'result', type: 'any' }
  });

  individual.getallergies = function (individuaId, cb) {
    const allergies = app.models.allergies;
    allergies.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individuaId } }, function (err, res) {
      console.log('kjh', res)
      if (err) {
        let result = {
          error: true,
          message: "something went wrong"
        }
        cb(null, result)
      }
      else {
        let result = {
          error: false,
          result: res,
          message: "Allergy list get "
        }
        cb(null, result)
      }
    })
  }

  /****************************************** ENDS **************************************************************** */
};
  // individual.find({where:{family:{inq:['Father']}}},function(err,res){
// individual.find({
//   where: { userId: 'resource:io.mefy.commonModel.User#' + userId },
//   include: {
//     relation: "family",
//     scope: {
//       include: {
//         relation: "individual"

//       },
//     }
//   }
// }, function (err, res) {
//   console.log('response', res)
//   cb(null, res)
// })

// {"name":"dev","phoneNumber":"823894944","city":"jsr","dob":"3-23-1990","gender":"male","relation":"papa"}
// "family":{
//   "type":"hasOne",
//   "model":"individual",
//   "foreignKey":"individual",
//   "through": "individual"

// }