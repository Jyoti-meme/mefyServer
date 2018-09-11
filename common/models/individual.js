'use strict';

const Composer = require('../lib/composer.js');

module.exports = function (individual) {

  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "updateProfile", "deleteById","find"];
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
      { arg: 'data', type: 'obj' }
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
      { arg: 'data', type: 'obj' }
    ],
    returns: { arg: 'result', type: 'string' },
  });

  individual.addFamily = function (userId, data, cb) {
    let famarray=[];
    individual.create(
      { name:data.name,phoneNumber: data.phoneNumber,dob:data.dob,gender:data.gender,city:data.city }, function (err, res) {
      console.log('created individual data', res)
     
      individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + userId } }, function (err, exists) {   
             console.log('exists', exists);
        if (exists != null && Object.keys(exists).length != 0) {
         let datas={
           relation:data.relation,
           individual:res.individualId
         } 
         exists.family.push(datas);
          console.log('data to be updated',famarray)
          exists.updateAttribute('family',exists.family, function (err, result) {
            console.log('result', result)
            let successmessage={
              error:false,
              result:result,
              message:'Family member addition failed'
            }
            cb(null,successmessage);
          })
        }
        else {
          let errormessage={
            error:true,
            message:"User not found"
          }
          cb(null,errormessage);
        }
      })

    })
  }

  /******************************************* ENDS *************************************** */
};


// {"name":"dev","phoneNumber":"823894944","city":"jsr","dob":"3-23-1990","gender":"male","relation":"papa"}