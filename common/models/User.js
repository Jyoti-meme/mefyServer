'use strict';

const Composer = require('../lib/composer.js');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const bizNetworkConnection = new BusinessNetworkConnection();
const cardName = "admin@mefy";

module.exports = function (User) {

  /***CHECK THE EXISTENCE OF EMAIL AND PHONENUMBER */
  User.validatesUniquenessOf('email', { message: 'EMAIL ALREADY EXIST' });
  // User.validatesUniquenessOf('phoneNumber', { message: 'USER WITH THIS PHONENUMBER  ALREADY EXIST' });
  /**    CHECKING COMPLETED */

  User.beforeRemote('create', function (context, user, next) {
    User.find({ where: { phoneNumber: context.args.data.phoneNumber } }, function (err, exists) {
      console.log('EXISTED', exists);
      if (exists.length != 0) {
        var x = {
          error: 'true',
          message: 'phonenumber already exist'
        }
        next(x);
      }
      else {
        next();
      }

    })
  })

  User.afterRemote('**', function (context, user, next) {
    var status = context.res.statusCode;
    console.log('STATUS', context.res.statusCode + 'MESSAGE' + context.res.message);
    console.log('RESULT', context.result)
    // if(context.res.statusCode && context.res.statusCode==200){
    context.result = {
      error: 'false',
      users: context.result,
      message: context.methodString + " success"
    }
    // }

    next();
  })

  // User.addPharmacy = async function (userData) {

  //   bizNetworkConnection.connect(cardName)
  //     .then((result) => {
  //       bizNetworkConnection.getAssetRegistry('io.mefy.pharmacy.User')
  //         .then((result) => {
  //           console.log(result);
  //           // this.titlesRegistry = result;
  //         });
  //     }).catch((error) => {
  //       console.log(error);
  //     });

  //   let userId = "9734072595";
  //   let pharmacyUser = {
  //     "tradeLicenseId": "tradelisenceone",
  //     "role": "admin"
  //   }
  //   return userData;
  // }

  User.remoteMethod('addPharmacy', {
    accepts: { arg: 'phoneNumber', type: 'string' },
    returns: { arg: 'phoneNumber', type: 'string' }
  });

};
