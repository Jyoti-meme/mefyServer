'use strict';

const Composer = require('../lib/composer.js');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const bizNetworkConnection = new BusinessNetworkConnection();
const cardName = "admin@mefy";
const app=require('../../server/server');
module.exports = function (User) {

  /***CHECK THE EXISTENCE OF EMAIL AND PHONENUMBER */
  User.validatesUniquenessOf('email', { message: 'email already exists' });
  User.validatesUniquenessOf('phoneNumber', { message: 'phoneNumber already exists' });


  /*** AFTER REMOTE METHOD  */
  // User.afterRemote('**', function (context, user, next) {
  //   var status = context.res.statusCode;
  //   context.result = {
  //     error: 'false',
  //     users: context.result,
  //     message: context.methodString + " success"
  //   }

  //   next();
  // })

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

  User.registration = function (phoneNumber, role, name, gender, dob, city, deviceId, cb) {
    console.log('USER', phoneNumber, role)
    const Individual = app.models.individual;
    User.find({ where: { phoneNumber: phoneNumber } }, function (err, user) {
      console.log('user info', user)
      if (user.length != 0) {
        var response = {
          error: false,
          message: 'User alresdy registered'
        }
        cb(null, response)
        
      }
      else {
        User.create(
          {
              phoneNumber: phoneNumber,
              role: role,
          }, function(err, res) {
            console.log('user created response',res)
            // send otp and verify it then create individual
            Individual.create({
              name:name,
              phoneNumber:phoneNumber,
              gender:gender,
              dob:dob,
              city:city,
              deviceId:deviceId,
              userId:res.userId
            },function(err,res){
              console.log('RESPONSEEE',res)
              console.log('errrror',err)
              var sucresponse={
                error:false,
                user:res,
                message:'User created Successfully'
              }
              cb(null, err || sucresponse);
            })
           
              // cb(null);
          }
      );
        
      }
    });
   
  }

  User.remoteMethod('registration', {
    http: { path: '/registration', verb: 'post' },
    accepts: [
      { arg: 'phoneNumber', type: 'string' },
      { arg: 'role', type: 'string' },
      { arg: 'name', type: 'string' },
      { arg: 'gender', type: 'string' },
      { arg: 'dob', type: 'string' },
      { arg: 'city', type: 'string' },
      { arg: 'deviceId', type: 'string' }
    ],
    //   , ],
    returns: { arg: 'result', type: 'string' },
  },
  );

};
