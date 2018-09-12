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
                message: 'Family member addition failed'
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

//   individual.remoteMethod('getfamily', {
//     http: { path: '/getfamily', verb: 'get' },
//     description: "add family members",
//     accepts:
//       // { arg: 'individualId', type: 'string' },
//       { arg: 'userId', type: 'string' },
//     returns: { arg: 'result', type: 'string' },
//   });


//   individual.getfamily = function (userId, cb) {
//     console.log(userId)
//     individual.find({include: {individual: 'family'}}, function(err,res){
// cb(null,res)    })
//     // individual.find({
//     //   include: 'userId',
//     //   scope: {
//     //     fields: ['name', 'phoneNumber', 'role', 'gender', 'city'],
//     //     include: {
//     //       relation: 'User',
//     //       scope: {
//     //         where: { individualId: userId }
//     //       }
//     //     }
//     //   }
//     // }, function (err, res) {
//     //   console.log('fffff', res)
//     //   cb(null,res);
//     // })
//   }
    // individual.find({where:{family:{inq:['Father']}}},function(err,res){
    //   console.log('response',res)
    //   cb();
    // })

  //   include: {
  //     relation: 'product',
  //     scope: {
  //       fields: ['productDesc']
  //     }
  //   },
  //   where: {
  //     id: 1
  //   }
  // }
  /************************************************************************************* */
  // include: {
  //   relation: 'owner', // include the owner object
  //   scope: { // further filter the owner object
  //     fields: ['username', 'email'], // only show two fields
  //     include: { // include orders for the owner
  //       relation: 'orders', 
  //       scope: {
  //         where: {orderId: 5} // only select order with id 5
  //       }
  //     }
  //   }
  // }
};


// {"name":"dev","phoneNumber":"823894944","city":"jsr","dob":"3-23-1990","gender":"male","relation":"papa"}