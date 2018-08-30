'use strict';
const Composer = require('../lib/composer.js');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const bizNetworkConnection = new BusinessNetworkConnection();
const cardName = "admin@mefy";
var app = require('../../server/server');

module.exports = function (UserPharmacy) {
  // Composer.restrictModelMethods(UserPharmacy);

  /** add remote hook  **/

  UserPharmacy.beforeRemote('create', function (context, user, next) {
    let userID = context.args.data.user;
    let pharmacy = context.args.data.pharmacy;
    // CHEKING USER EXISTENCE 
    checkUser(context.args.data.user).then(function (result) {
      //CHECKING PHARMACY EXISTENCE
      checkPharma(context.args.data.pharmacy).then(function (result) {
        // CREATE RECORDID IF USER AND PHARMA EXIST
        context.args.data.recordId = pharmacy + '-' + userID + '-' + context.args.data.role;
        next();
      })
        // THROW ERROR
        .catch(function (err) {
          var err = new Error(err);
          err.statusCode = 404;
          next(err);
        })

    })
      // THROW ERROR
      .catch(function (err) {
        var err = new Error(err);
        err.statusCode = 404;
        next(err);
      })
    // context.args.data.date = Date.now();
    // context.args.data.publisherId = context.req.accessToken.userId;

  });

  // CHECK USER EXIST OR NOT
  function checkUser(user) {
    const User = app.models.User;
    return new Promise((resolve, reject) => {
      User.exists(user, function (err, exists) {
        if (exists) {
          resolve(true);
        }
        else {
          reject('USER DOESNOT EXISTS!');
        }
      })
    })
  }

  // CHECK EXISTENCE OF PHARMACY
  function checkPharma(pharma) {
    const Pharmacy = app.models.Pharmacy;
    return new Promise((resolve, reject) => {
      Pharmacy.exists(pharma, function (err, exists) {
        if (exists) {
          resolve(true);
        }
        else {
          reject('PHARMACY DOESNOT EXISTS!');
        }
      })
    })
  }


  /** INSERT PHARMACY DATA*/
  UserPharmacy.observe('loaded', function (context, next) {
    const Pharmacy = app.models.Pharmacy;
    const User = app.models.User;
    // FETCH PHARMACY DETAILS
    Pharmacy.find({ where: { tradeLicenseId: context.data.pharmacy.includes('#') ? context.data.pharmacy.split("#")[1] : context.data.pharmacy } }, function (err, pharmacies) {
      context.data.pharmacy = pharmacies[0];
      //  FETCH USER DETAIL 
      User.find({ where: { phoneNumber: context.data.user.includes('#') ? context.data.user.split("#")[1] : context.data.user } }, function (err, users) {
        context.data.user = users[0];
        next();
      })

    });

  });


  /** custom remote method **/
  UserPharmacy.byUser = function (phonenumber, cb) {
    let user = "resource:io.mefy.pharmacy.User#" + phonenumber;
    UserPharmacy.find({ where: { user: user } }, function (err, pharmacies) {
      console.log(pharmacies);
      cb(null, pharmacies);
    });
  }

  UserPharmacy.remoteMethod('byUser', {
    accepts: { arg: 'phonenumber', type: 'string' },
    returns: { arg: 'pharmacies', type: 'any' },
    http: { path: '/user', verb: 'get' }
  });


  /** count user pharmacy **/
  /** custom remote method **/
  UserPharmacy.countByUser = function (phonenumber, cb) {
    let user = "resource:io.mefy.pharmacy.User#" + phonenumber;
    UserPharmacy.find({ where: { user: user } }, function (err, pharmacies) {
      cb(null, pharmacies.length);
    });
  }

  UserPharmacy.remoteMethod('countByUser', {
    accepts: { arg: 'phonenumber', type: 'string' },
    returns: { arg: 'count', type: 'any' },
    http: { path: '/countbyuser', verb: 'get' }
  });


};
