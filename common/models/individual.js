'use strict';

const Composer = require('../lib/composer.js');

module.exports = function (individual) {

  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "updateProfile", "deleteById", "find"];
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
    individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + userId } }, function (err, user) {
      if (user != null && Object.keys(user).length != 0) {
        ProcessArray(user.family).then(users => {
          let result = {
            error: false,
            family: users,
            message: 'family member get successfull'
          }
          cb(null, result)
        })
          .catch(err => {
            let errors = {
              error: true,
              message: 'Error in fetching data'
            }
            cb(null, errors);
          })
      } else {
        let errors = {
          error: true,
          message: 'Error in fetching data'
        }
        cb(null, errors);
      }
    })
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

  /************************************************************************************* */

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