'use strict';

const Composer = require('../lib/composer.js');
const app = require

module.exports = function (account) {
  const enabledRemoteMethods = ["findById", "deleteById", "find", "addBankAccount", "getBankAccount"];
  account.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      account.disableRemoteMethodByName(methodName);
    }
  });
  /*********************** CREATE BANK ACCOUNT ****************** */

  account.remoteMethod('addBankAccount', {
    http: { path: '/addBankAccount', verb: 'post' },
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' },
  });

  account.addBankAccount = function (data, cb) {
    if (data != null && Object.keys(data).length != 0) {
      if (data.doctorId) {
        account.create({ doctorId: data.doctorId, accountHolderName: data.accountHolderName, ifscCode: data.ifscCode, accountName: data.accountName, accountType: data.accountType,accountNumber:data.accountNumber }, function (err, account) {
          console.log(' Doctor account', account)
          let accountSucess = {
            error: false,
            result: account,
            message: 'Sucessfully Bank Account Created'
          }
          cb(null, accountSucess)
        })
      }
      else {
        account.create({ individualId: data.individualId, accountHolderName: data.accountHolderName, ifscCode: data.ifscCode, accountName: data.accountName, accountType: data.accountType,accountNumber:data.accountNumber }, function (err, account) {
          console.log(' Individual account', account)
          let accountSucess = {
            error: false,
            result: account,
            message: 'Sucessfully Bank Account Created'
          }
          cb(null, accountSucess)
        })
      }
    }
    else {
      let bankError = {
        error: true,
        message: 'Bank Account Not created'
      }
      cb(null, bankError)
    }
  }
  /********************************************************* END *************************************************/
  /*********************** GET BANK ACCOUNT BY DOCTORID OR INDIVIDUALID*************************** */

  account.remoteMethod('getBankAccount', {
    Description: "GET BANK ACCOUNT LIST BY DOCTORID OR INDIVIDUALID",
    http: { path: '/bankList', verb: 'get' },
    accepts: [{ arg: 'doctorId', type: 'string' }, { arg: 'individualId', type: 'string' }],
    returns: { arg: 'result', type: 'any' }
  });
  account.getBankAccount = function (doctorId, individualId, cb) {
    if (doctorId != null) {
      account.find({ where: { doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (err, exists) {
        if (exists != null && Object.keys(exists).length != 0) {
          console.log(' Doctor exists', exists)
          let bankList = {
            error: false,
            result: exists,
            message: "Get All Doctor's Bank Account"
          }
          cb(null, bankList)
        }
        else {
          let msg = {
            message: 'Not Available'
          }
          cb(null, msg)
        }
      })

    }
    else {
      account.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individualId } }, function (err, exists) {
        if (exists != null && Object.keys(exists).length != 0) {
          console.log(' individual exists', exists)
          let bankList = {
            error: false,
            result: exists,
            message: "Get All Individual's Bank Account"
          }
          cb(null, bankList)
        }
        else {
          let msg = {
            message: 'Not Available'
          }
          cb(null, msg)
        }
      })
    }
  }
  /********************************************************* END *************************************************/

};
