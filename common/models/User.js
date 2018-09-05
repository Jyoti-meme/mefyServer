'use strict';

const Composer = require('../lib/composer.js');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const bizNetworkConnection = new BusinessNetworkConnection();
const cardName = "admin@mefy";
const app = require('../../server/server');
;
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



  // USER REGISTRATION API
  User.registration = function (phoneNumber, role, cb) {
    console.log('USER', phoneNumber, role)
    User.find({ where: { and: [{ phoneNumber: phoneNumber }, { role: role }] } }, function (err, user) {
      console.log('user info', user)
      if (user.length != 0) {
        var response = {
          error: false,
          message: 'User already registered'
        }
        cb(null, response)

      }
      else {
        // *********send otp*******
        sendOtp(phoneNumber).then(function (result) {
          console.log('RRESULT', result)
          if (result.type == 'success') {
            var otpresponse = {
              err: false,
              message: 'OTP sent to registered number'
            }
            cb(null, otpresponse)
          }
          else {
            var otperror = {
              error: true,
              message: 'Otp sending falied',
              details: result
            }
            cb(null, otperror)
          }
        }).catch(err => {
          cb(null, err)
        })
        /******* */
      }

    })

  }
  // send otp to number
  function sendOtp(phoneNumber) {
    return new Promise((resolve, reject) => {
      let url = 'http://control.msg91.com/api/sendotp.php?authkey=235289A8Oo7Uojwo5b8cd569&message=%23%23OTP%23%23&sender=MEFYME&mobile=' + phoneNumber;
      fetch(url, {
        method: 'GET'
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          // console.log('JSON RESPONSE', responseJSON)
          resolve(responseJSON)
          // do something with jsonResponse
        });
      //   .catch((error) => {
      // }) 
    })
  }


  User.remoteMethod('registration', {
    http: { path: '/registration', verb: 'post' },
    accepts: [
      { arg: 'phoneNumber', type: 'string' },
      { arg: 'role', type: 'string' }
    ],
    returns: { arg: 'result', type: 'string' },
  },
  );

  /***************************VERIFY OTP************************************/
  User.verifyotp = function (phoneNumber, otp, role, name, gender, dob, city, deviceId, socketId, cb) {
    console.log('USER Verification', phoneNumber, otp)
    const Individual = app.models.individual
    verifyOtp(phoneNumber, otp).then(function(result) {
      console.log('resultttttt', result)
      if (result.type == 'success') {
        // for user creation and individual creation

        User.create(
          { phoneNumber: phoneNumber, role: role, }, function (err, res) {
            console.log('user created response', res)
            // send otp and verify it then create individual
            Individual.create({
              name: name, phoneNumber: phoneNumber, gender: gender, dob: dob, city: city, deviceId: deviceId, userId: res.userId, socketId: socketId ? socketId : ''
            }, function (err, res) {
              console.log('created individual data', res)
              var sucresponse = {
                error: false,
                user: res,
                message: 'User created Successfully'
              }
              cb(null, sucresponse);
            })
          }
        );
      }
      else {
        var otperror = {
          error: true,
          message: ' Invalid Otp ',
        }
        cb(null, otperror)
      }
    })
      .catch(err => {
        cb(null, err)
      })
  }

  function verifyOtp(phoneNumber, otp) {
    console.log('dataaaa', phoneNumber, otp)
    return new Promise((resolve, reject) => {
      let verifyOtpUrl = 'https://control.msg91.com/api/verifyRequestOTP.php?authkey=235289A8Oo7Uojwo5b8cd569&mobile=' + phoneNumber + '&otp=' + otp;
      console.log('verifyOtpUrl', verifyOtpUrl)
      fetch(verifyOtpUrl, {
        method: 'POST'
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log('url json response', responseJSON)
          resolve(responseJSON)
        }).catch(err=>{
          reject(err)
        })
      // })
    })
  }

  User.remoteMethod('verifyotp', {
    http: { path: '/verifyotp', verb: 'post' },
    accepts: [
      { arg: 'phoneNumber', type: 'string' },
      { arg: 'otp', type: 'string' },
      { arg: 'role', type: 'string' },
      { arg: 'name', type: 'string' },
      { arg: 'gender', type: 'string' },
      { arg: 'dob', type: 'string' },
      { arg: 'city', type: 'string' },
      { arg: 'deviceId', type: 'string' },
      { arg: 'socketId', type: 'string' }
    ],
    return: { arg: 'result', type: 'string' },
  })


/**************RESEND OTP ****************** */
User.remoteMethod('resendOtp', {
  http: { path: '/resendOtp', verb: 'post' },
  accepts: [{ arg: 'phoneNumber', type: 'string' },
  { arg: 'retrytype', type: 'string' }],
  return: { arg: 'result', type: 'string' }
})

User.resendOtp = function (phoneNumber,retrytype, cb) {
  let url = "http://control.msg91.com/api/retryotp.php?authkey=235289A8Oo7Uojwo5b8cd569&mobile=" + phoneNumber+'&retrytype='+retrytype;
  fetch(url, {
    method: 'POST'
  })
    .then((response) => response.json())
    .then((responseJSON) => {
      console.log('url json response', responseJSON)
      if (responseJSON.type = "success") {
        var resendresponse = {
          error: false,
          message: 'OTP sent successfully'
        }
        cb(null, resendresponse);
        console.log('after reseb dotp')
      }
      else {
        var responses = {
          error: true,
          message: 'OTP sending failed'
        }
        cb(null, responses)
      }
    });
}
/******************************************* */



};

/**********************END OF VERIFY OTP*******************************/



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