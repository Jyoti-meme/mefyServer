'use strict';

const Composer = require('../lib/composer.js');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const bizNetworkConnection = new BusinessNetworkConnection();
const cardName = "admin@mefy";

module.exports = function (User) {

  /***CHECK THE EXISTENCE OF EMAIL AND PHONENUMBER */
  User.validatesUniquenessOf('email', { message: 'email already exists' });
  User.validatesUniquenessOf('phoneNumber', { message: 'phoneNumber already exists' });


  /*** AFTER REMOTE METHOD  */
  User.afterRemote('**', function (context, user, next) {
    var status = context.res.statusCode;
    context.result = {
      error: 'false',
      users: context.result,
      message: context.methodString + " success"
    }

    next();
  })

  /*** CATCH ERORRS */
  User.afterRemoteError('create', function (ctx, next) {
    var objectname = Object.keys(ctx.error.details.messages)[0]
    ctx.error.message = ctx.error.details.messages[objectname][0];
    delete ctx.error['details'];
    delete ctx.error['stack'];
    next(ctx.error);
  });


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
