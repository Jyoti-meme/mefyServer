'use strict';

const Composer = require('../lib/composer.js');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const bizNetworkConnection = new BusinessNetworkConnection();
const cardName = "admin@mefy";
const app = require('../../server/server');

module.exports = function (User) {

  /***CHECK THE EXISTENCE OF EMAIL AND PHONENUMBER */
  // User.validatesUniquenessOf('email', { message: 'email already exists' });
  // User.validatesUniquenessOf('phoneNumber', { message: 'phoneNumber already exists' });


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


// HIDE UNUSED REMOTE METHODS
const enabledRemoteMethods = ["create","findById", "registration", "deleteById","verifyotp","resendOtp","login","profile"];
User.sharedClass.methods().forEach(method => {
  console.log('metods name',method.stringName)
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      User.disableRemoteMethodByName(methodName);
    }
  });




  /*** CATCH ERORRS */
  User.afterRemoteError('create', function (ctx, next) {
    console.log(ctx.error.details)
    var objectname = Object.keys(ctx.error.details.messages)[0]
    ctx.error.message = ctx.error.details.messages[objectname][0];
    delete ctx.error['details'];
    delete ctx.error['stack'];
    next(ctx.error);
  });

  /************USER REGISTRATION OTP SENDING STARTS **************** */
  User.remoteMethod('registration', {
    http: { path: '/preregistration', verb: 'post' },
    accepts: [
      { arg: 'phoneNumber', type: 'string' },
      { arg: 'role', type: 'string' }
    ],
    returns: { arg: 'result', type: 'string' },
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
      let url = 'http://control.msg91.com/api/sendotp.php?authkey=236155AYj2f1NozV5b921323&message=%23%23OTP%23%23&sender=MEFYME&mobile=' + phoneNumber;
      fetch(url, {
        method: 'GET'
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          resolve(responseJSON)
        })
        .catch((error) => {
          reject(err)
        })
    })
  }
/******************************* ENDS ************************************************* */
  /************************************VERIFY OTP STARTS *********************************/

  User.remoteMethod('verifyotp', {
    http: { path: '/registration', verb: 'post' },
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
    returns: { arg: 'result', type: 'string' },
  });


  // d
  User.verifyotp = function (phoneNumber, otp, role, name, gender, dob, city, deviceId, socketId, cb) {
    console.log('USER', phoneNumber, role)
    // cb(null,{ name: "Pushpendu" });
    const Doctor = app.models.doctor;
    const Individual = app.models.individual;
    verifyOtp(phoneNumber, otp).then(function (result) {
      console.log('resultttttt', result)
      if (result.type == 'success') {
        // for user creation and individual creation
        console.log('user  role', role)
        /**Doctor created**/
        if (role == 'doctor') {
          User.create(
            { phoneNumber: phoneNumber, role: role, }, function (err, res) {
              console.log('user created response', res)
              // send otp and verify it then create Doctor
              Doctor.create({
                name: name, phoneNumber: phoneNumber, gender: gender, dob: dob, city: city, deviceId: deviceId, userId: res.userId, socketId: socketId ? socketId : ''
              }, function (err, res) {
                console.log('created Doctor data', res)
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
          /** User created**/
          User.create(
            { phoneNumber: phoneNumber, role: role, }, function (err, res) {
              console.log('user created response', res)
              // send otp and verify it then create individual
              Individual.create({
                name: name, phoneNumber: phoneNumber, gender: gender, dob: dob, city: city, deviceId: deviceId, userId: res.userId, socketId: socketId ? socketId : ''
              }, function (err, res) {
                console.log('created individual data', res)
                var sucresponse1 = {
                  error: false,
                  user: res,
                  message: 'User created Successfully'
                }
                cb(null, sucresponse1);
              })
            }
          );
        }
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
        var otperror1 = {
          error: true,
          message: '  Otp verification failed',
        }
        cb(null, otperror1)
      })

  }


  function verifyOtp(phoneNumber, otp) {
    console.log('dataaaa', phoneNumber, otp)
    return new Promise((resolve, reject) => {
      let verifyOtpUrl = 'https://control.msg91.com/api/verifyRequestOTP.php?authkey=236155AYj2f1NozV5b921323&mobile=' + phoneNumber + '&otp=' + otp;
      console.log('verifyOtpUrl', verifyOtpUrl)
      fetch(verifyOtpUrl, {
        method: 'POST'
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log('url json response', responseJSON)
          resolve(responseJSON)
        }).catch(err => {
          reject(err)
        })
      // })
    })
  }

  /**********************END OF VERIFY OTP*******************************/

  /******************************** RESEND OTP STARTS  ********************** */
  User.remoteMethod('resendOtp', {
    http: { path: '/resendotp', verb: 'post' },
    accepts: [
      { arg: 'phoneNumber', type: 'string' },
      { arg: 'retrytype', type: 'string' }
    ],
    returns: { arg: 'result', type: 'string' },
  });



  // USER REGISTRATION API
  User.resendOtp = function (phoneNumber, retrytype, cb) {
    let url = "http://control.msg91.com/api/retryotp.php?authkey=236155AYj2f1NozV5b921323&mobile=" + phoneNumber + '&retrytype=' + retrytype;
    fetch(url, {
      method: 'POST'
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        console.log('url json response', responseJSON)
        if (responseJSON.type == "success") {
          console.log('inside if')
          let resendresponse = {
            error: false,
            message: 'OTP sent successfully'
          }
          cb(null, resendresponse);
          console.log('after reseb dotp')
        }
        else {
          console.log('inside else')
          let responses = {
            error: true,
            message: 'OTP sending failed'
          }
          cb(null, responses)
        }
      }).catch(err => {
        let responses1 = {
          error: true,
          message: 'OTP sending failed'
        }
        cb(null, responses1)
      })
  }
  /******************************** ENDS ****************************************** */

  /***********************USER(INDIVIDUAL/DOCTOR) LOGIN* STARTS ************************** */
  User.remoteMethod('login', {
    http: { path: '/login', verb: 'post' },
    accepts: [
      { arg: 'phoneNumber', type: 'string', required: true },
      { arg: 'deviceId', type: 'string', required: true },
      { arg: 'role', type: 'string', required: true }
    ],
    returns: { arg: 'result', type: 'string' },
  });

  User.login = function (phoneNumber, deviceId, role, cb) {
    console.log(phoneNumber, deviceId, role)
    const Individual = app.models.individual;
    const Doctor = app.models.doctor;

    User.findOne({ where: { and: [{ phoneNumber: phoneNumber }, { role: role }] } }, function (err, exists) {
      console.log('user existence', exists)
      if (exists!=null  && Object.keys(exists).length != 0) {
        //user exists 
        if (role == 'doctor') {
          console.log(exists.userId)
          Doctor.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + exists.userId } }, function (err, doctor) {
            console.log('doctor', doctor)
            if (doctor.deviceId == deviceId) {
              console.log('device id matched')
              // login
              let dloggedin = {
                error: false,
                user: doctor,
                message: 'Doctor loggedIn successfully'
              }
              cb(null, dloggedin)
            }
            else {
              // send otp
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
            }

          })
        }
        else {
          Individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + exists.userId } }, function (err, individual) {
            console.log('in', individual)

            if (individual.deviceId == deviceId) {
              //login
              let loggedin = {
                error: false,
                user: individual,
                message: 'Individual loggedIn successfully'
              }
              cb(null, loggedin)
            }
            else {
              //send otp
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
            }

          })
        }

      }
      else {
        //user not registered
        let errMessage = {
          error: true,
          message: 'User not Registered'
        }
        cb(null, errMessage)
      }
    })
  }


  /*********************************  END  ********************************************* */

  /*************** GET USER PROFILE FOR DOCTOR/INDIVIDUAL  STARTS ************************ */
  User.remoteMethod('profile', {
    http: { path: '/profile', verb: 'get' },
    accepts: [
      { arg: 'userId', type: 'string', required: true },
      { arg: 'role', type: 'string', required: true }
    ],
    returns: { arg: 'result', type: 'string' },
  });

  User.profile = function (userId, role, cb) {
    console.log(userId, role)
    const Doctor = app.models.doctor;
    const Individual = app.models.individual;
    User.findOne({ where: { userId: userId } }, function (err, exists) {
      console.log('user existence', exists, userId)
      if (exists!=null  && Object.keys(exists).length != 0 ) {
        //user exists 
        if (role == 'doctor') {
          Doctor.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + userId } }, function (err, doctor) {
            console.log('doctor', doctor)
            // login
            let dloggedin = {
              error: false,
              user: doctor,
              message: 'Doctor Profile'
            }
            cb(null, dloggedin)

          })
        }
        else {
          Individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + userId } }, function (err, individual) {
            console.log('in', individual)
            //login
            let loggedin = {
              error: false,
              user: individual,
              message: 'Individual Profile'
            }
            cb(null, loggedin)

          })
        }

      }
      else {
        //user not exists
        let errMessage = {
          error: true,
          message: 'User not Exists'
        }
        cb(null, errMessage)
      }
    })
  }
  /*******************************   ENDS   ***********************************************/











};












