'use strict';

const Composer = require('../lib/composer.js');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const bizNetworkConnection = new BusinessNetworkConnection();
const cardName = "admin@mefy";
const app = require('../../server/server');
var loopback = require('loopback');

var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

// Substitute your Twilio AccountSid and ApiKey details
var ACCOUNT_SID = 'AC49068842fea55576144b52ca32ec6395'; //account sid
var API_KEY_SID = 'SK72c5e59d3d43962e1169419ff9b0f64d';
var API_KEY_SECRET = '5CfQhyzGrW8MCEOZqtuCPS4bIEPVrIhQ';

// Create an Access Token
var accessToken = new AccessToken(
  ACCOUNT_SID,
  API_KEY_SID,
  API_KEY_SECRET
);

module.exports = function (User) {

  /***CHECK THE EXISTENCE OF EMAIL AND PHONENUMBER */
  // User.validatesUniquenessOf('email', { message: 'email already exists' });
  User.validatesUniquenessOf('phoneNumber', { message: 'phoneNumber already exists' });


  // /*** AFTER REMOTE METHOD  */
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
  const enabledRemoteMethods = ["create", "find", "findById", "registration", "deleteById", "verifyotp", "resendOtp", "login", "profile", "loginByScanner", "verifyotplogin", "doctorWebLogin", "verifyNumber", "twilloToken"];
  User.sharedClass.methods().forEach(method => {
    // console.log('metods name',method.stringName)
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      User.disableRemoteMethodByName(methodName);
    }
  });




  /*** CATCH ERORRS */
  User.afterRemoteError('create', function (ctx, next) {
    console.log('jyoti mala', ctx.error.details)
    var objectname = Object.keys(ctx.error.details.messages)[0]
    ctx.error.message = ctx.error.details.messages[objectname][0];
    delete ctx.error['details'];
    delete ctx.error['stack'];
    next(ctx.error);
  });

  /************USER REGISTRATION OTP SENDING STARTS **************** */
  User.remoteMethod('registration', {
    http: { path: '/preregistration', verb: 'post' },
    accepts:
      { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'string' },
  });

  // USER REGISTRATION API
  User.registration = function (data, cb) {
    console.log('USER', data)
    // where: { and: [{ phoneNumber: data.phoneNumber }, { role: data.role }]
    User.find({ where: { phoneNumber: data.phoneNumber } }, function (err, user) {
      console.log('error', err)
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
        var otpresponse = {
          err: false,
          message: 'OTP sent to registered number'
        }
        cb(null, otpresponse)
        // sendOtp(data.phoneNumber).then(function (result) {
        //   console.log('RRESULT', result)
        //   if (result.type == 'success') {
        //     var otpresponse = {
        //       err: false,
        //       message: 'OTP sent to registered number'
        //     }
        //     cb(null, otpresponse)
        //   }
        //   else {
        //     var otperror = {
        //       error: true,
        //       message: 'Otp sending falied',
        //       details: result
        //     }
        //     cb(null, otperror)
        //   }
        // }).catch(err => {
        //   cb(null, err)
        // })
        /******* */
      }

    })

  }

  // send otp to number
  function sendOtp(phoneNumber) {
    return new Promise((resolve, reject) => {
      let url = 'http://control.msg91.com/api/sendotp.php?authkey=236155AYj2f1NozV5b921323&message=%23%23OTP%23%23&sender=MEFYME&mobile=' + phoneNumber + '';
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
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    // [
    //   { arg: 'phoneNumber', type: 'string' },
    //   { arg: 'otp', type: 'string' },
    //   { arg: 'role', type: 'string' },

    //   { arg: 'name', type: 'string' },
    //   { arg: 'gender', type: 'string' },
    //   { arg: 'dob', type: 'string' },
    //   { arg: 'city', type: 'string' },
    //   { arg: 'deviceId', type: 'string' },
    //   { arg: 'socketId', type: 'string' }
    // ],
    returns: { arg: 'result', type: 'any' },
  });


  // d
  User.verifyotp = function (data, cb) {
    console.log('USER', data)
    // cb(null,{ name: "Pushpendu" });
    const Doctor = app.models.doctor;
    const Individual = app.models.individual;
    verifyOtp(data.phoneNumber, data.otp).then(function (result) {
      console.log('resultttttt', result)
      // if (result.type == 'success') {
      // for user creation and individual creation
      if (result) {
        console.log('user  role', data.role)
        /**Doctor created**/
        if (data.role == 'doctor') {
          User.create(
            { phoneNumber: data.phoneNumber, role: data.role, }, function (err, res) {
              console.log('user created response', res)
              // send otp and verify it then create individual
              Doctor.create({
                name: data.name, phoneNumber: data.phoneNumber, gender: data.gender, dob: data.dob,
                city: data.city, deviceId: data.deviceId ? data.deviceId : '', userId: res.userId,
                socketId: data.socketId ? data.socketId : '', language: data.language ? data.language : [],
                education: data.education ? data.education : [], speciality: data.speciality ? data.speciality : [],
                practicingSince: data.practicingSince ? data.practicingSince : '', email: data.email ? data.email : '',
                token: data.token ? data.token : '', issuingAuthority: data.issuingAuthority ? data.issuingAuthority : '',
                state: data.state ? data.state : '', registrationNumber: data.registrationNumber ? data.registrationNumber : '',
                address: data.address ? data.address : ''
              }, function (err, res) {
                console.log('created doctor data', res, err)
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
        else {
          /** User created**/
          User.create(
            { phoneNumber: data.phoneNumber, role: data.role, }, function (err, res) {
              console.log('user created response', res)
              // send otp and verify it then create individual
              Individual.create({
                name: data.name, phoneNumber: data.phoneNumber, gender: data.gender, dob: data.dob, city: data.city, deviceId: data.deviceId, userId: res.userId, socketId: data.socketId ? data.socketId : ''
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
        console.log(err)
        var otperror1 = {
          error: true,
          message: 'Otp verification failed',
        }
        cb(null, otperror1)
      })

  }


  function verifyOtp(phoneNumber, otp) {
    console.log('dataaaaa', phoneNumber, otp)
    return new Promise((resolve, reject) => {

      if (otp == "8888") {
        resolve(true)
      }
      else {
        reject(false)
      }
      // let verifyOtpUrl = 'https://control.msg91.com/api/verifyRequestOTP.php?authkey=236155AYj2f1NozV5b921323&mobile=' + phoneNumber + '&otp=' + otp;
      // console.log('verifyOtpUrl', verifyOtpUrl)
      // fetch(verifyOtpUrl, {
      //   method: 'POST'
      // })
      //   .then((response) => response.json())
      //   .then((responseJSON) => {
      //     console.log('url json response', responseJSON)
      //     resolve(responseJSON)
      //   }).catch(err => {
      //     reject(err)
      //   })
      // })
    })
  }

  /**********************END OF VERIFY OTP*******************************/

  /******************************** RESEND OTP STARTS  ********************** */
  User.remoteMethod('resendOtp', {
    http: { path: '/resendotp', verb: 'post' },
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    // [
    //   { arg: 'phoneNumber', type: 'string' },
    //   { arg: 'retrytype', type: 'string' }
    // ],
    returns: { arg: 'result', type: 'string' },
  });



  // USER REGISTRATION API
  User.resendOtp = function (data, cb) {
    let resendresponse = {
      error: false,
      message: 'OTP sent successfully'
    }
    cb(null, resendresponse);
    // let url = "http://control.msg91.com/api/retryotp.php?authkey=236155AYj2f1NozV5b921323&mobile=" + data.phoneNumber + '&retrytype=' + data.retrytype;
    // fetch(url, {
    //   method: 'POST'
    // })
    //   .then((response) => response.json())
    //   .then((responseJSON) => {
    //     console.log(responseJSON);
    //     console.log('url json response', responseJSON)
    //     if (responseJSON.type == "success") {
    //       console.log('inside if')
    //       let resendresponse = {
    //         error: false,
    //         message: 'OTP sent successfully'
    //       }
    //       cb(null, resendresponse);
    //       console.log('after reseb dotp')
    //     }
    //     else {
    //       console.log('inside else')
    //       let responses = {
    //         error: true,
    //         message: 'OTP sending failed'
    //       }
    //       cb(null, responses)
    //     }
    //   }).catch(err => {
    //     let responses1 = {
    //       error: true,
    //       message: 'OTP sending failed'
    //     }
    //     cb(null, responses1)
    //   })
  }
  /******************************** ENDS ****************************************** */

  /***********************USER(INDIVIDUAL/DOCTOR) LOGIN* STARTS ************************** */
  User.remoteMethod('login', {
    http: { path: '/login', verb: 'post' },
    accepts: { arg: 'logindata', type: 'object', http: { source: 'body' } },
    // [
    //   { arg: 'phoneNumber', type: 'string', required: true },
    //   { arg: 'deviceId', type: 'string', required: true },
    //   { arg: 'role', type: 'string', required: true }
    // ],
    returns: { arg: 'result', type: 'string' },
  });

  User.login = function (logindata, cb) {
    console.log(logindata)
    const Individual = app.models.individual;
    const Doctor = app.models.doctor;
    // User.findOne({where:{and:[{phoneNumber:logindata.phoneNumber},{role:logindata.role}] } },function(err,exists){
    User.findOne({ where: { and: [{ phoneNumber: logindata.phoneNumber }, { role: logindata.role }] } }, function (err, exists) {
      console.log('user existence', exists)
      // cb(null,exists)
      if (exists != null && Object.keys(exists).length != 0) {

        //user exists 
        if (logindata.role == 'doctor') {
          console.log(exists.userId)
          Doctor.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + exists.userId } }, function (err, doctor) {
            console.log('doctor', doctor)
            if (doctor.deviceId == logindata.deviceId) {
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
              var otpresponse = {
                err: false,
                message: 'OTP sent to registered number'
              }
              cb(null, otpresponse)
              // sendOtp(logindata.phoneNumber).then(function (result) {
              //   console.log('RRESULT', result)
              //   if (result.type == 'success') {
              //     var otpresponse = {
              //       err: false,
              //       message: 'OTP sent to registered number'
              //     }
              //     cb(null, otpresponse)
              //   }
              //   else {
              //     var otperror = {
              //       error: true,
              //       message: 'Otp sending falied',
              //       details: result
              //     }
              //     cb(null, otperror)
              //   }
              // }).catch(err => {
              //   cb(null, err)
              // })
            }

          })
        }
        else {
          Individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + exists.userId } }, function (err, individual) {
            console.log('in', individual)

            if (individual.deviceId == logindata.deviceId) {
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
              var otpresponse = {
                err: false,
                message: 'OTP sent to registered number'
              }
              cb(null, otpresponse)
              // sendOtp(logindata.phoneNumber).then(function (result) {
              //   console.log('RRESULT', result)
              //   if (result.type == 'success') {
              //     var otpresponse = {
              //       err: false,
              //       message: 'OTP sent to registered number'
              //     }
              //     cb(null, otpresponse)
              //   }
              //   else {
              //     var otperror = {
              //       error: true,
              //       message: 'Otp sending falied',
              //       details: result
              //     }
              //     cb(null, otperror)
              //   }
              // }).catch(err => {
              //   cb(null, err)
              // })
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


  /**************************************VERIFY OTP FOR LOGIN ************************************** */
  User.remoteMethod('verifyotplogin', {
    http: { path: '/verifyotp', verb: 'post' },
    accepts: { arg: 'otpdata', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'string' },
  });


  User.verifyotplogin = function (otpdata, cb) {
    console.log('data received', otpdata);
    verifyOtp(otpdata.phoneNumber, otpdata.otp).then(function (otpresult) {
      console.log('result', otpresult)
      if (otpresult) {
        //matched
        User.findOne({ where: { phoneNumber: otpdata.phoneNumber } }, function (err, response) {
          console.log('response', response);
          if (response != null && Object.keys(response).length != 0) {

            if (otpdata.role === 'doctor') {
              //get profile of doctor
              const doctor = app.models.doctor;
              doctor.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + response.userId } }, function (err, doctor) {
                console.log('dcotor detail', doctor);
                let data = {
                  error: false,
                  result: doctor,
                  message: 'doctor profile detail'
                }
                cb(null, data)
              })
            }
            else {
              // get profile of individual
              const individual = app.models.individual
              individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + response.userId } }, function (err, individual) {
                console.log('dcotor detail', individual);
                let data = {
                  error: false,
                  result: individual,
                  message: 'individual profile detail'
                }
                cb(null, data)
              })
            }
          }
          else {
            let data = {
              error: true,
              message: 'User not found'
            }
            cb(null, data);
          }
        })

      }
      else {
        //not matched
        let data = {
          error: true,
          message: 'Otp verification failed'
        }
        cb(null, data);
      }
    }).catch(err => {
      let data = {
        error: true,
        message: 'Otp verification failed'
      }
      cb(null, data);
    })

  }
  /************************************************************************************************** */


  /*************** GET USER PROFILE FOR DOCTOR/INDIVIDUAL  STARTS ************************ */
  User.remoteMethod('profile', {
    http: { path: '/profile', verb: 'get' },
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    // [
    //   { arg: 'userId', type: 'string', required: true },
    //   { arg: 'role', type: 'string', required: true }
    // ],
    returns: { arg: 'result', type: 'string' },
  });

  User.profile = function (data, cb) {
    console.log(data)
    const Doctor = app.models.doctor;
    const Individual = app.models.individual;
    User.findOne({ where: { userId: data.userId } }, function (err, exists) {
      console.log('user existence', exists, userId)
      if (exists != null && Object.keys(exists).length != 0) {
        //user exists 
        if (data.role == 'doctor') {
          Doctor.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + data.userId } }, function (err, doctor) {
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
          Individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + data.userId } }, function (err, individual) {
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

  /************************ SOCKET CONNECT AT LOGIN******************* */
  // User.observe('after save', function (ctx, next) {
  //   var socket = User.app.io;
  //   //Now publishing the data..

  //   sockConnection.publish(socket, {
  //     collectionName: 'User',
  //     data: ctx.instance,
  //     method: 'POST'
  //   });
  //   next();
  // }); //after save..
  /*******************************  ENDS **************************/

  /**************************** LOGIN BY SCANNER ***************************/
  User.remoteMethod('loginByScanner', {
    http: { path: '/loginByScanner', verb: 'post' },
    accepts: { arg: 'data', type: 'object', required: true, http: { source: 'body' } },

    returns: { arg: 'result', type: 'string' },
  });

  /******************************  API LOGIC  *********************** */
  User.loginByScanner = function (data, cb) {
    console.log('user Detail....', data.userId, data.socketId, data.role)
    const Individual = app.models.individual;
    const Doctor = app.models.doctor;
    var socket = app.io;
    User.findOne({ where: { userId: data.userId } }, function (err, exists) {
      if (err) {
        let errormessage = {
          error: true,
          message: "Something Weng Wrong. Please try again"
        }
        cb(null, errormessage);
      }
      else {

        if (exists != null && Object.keys(exists).length != 0) {
          if (data.role == 'doctor') {
            Doctor.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + data.userId } }, function (err, doctor) {
              console.log('exists doctor..........', data.socketId)


              socket.to(data.socketId).emit("loginByScanner", {
                doctorId: doctor.doctorId
              });

              let response = {
                error: false,
                message: "Logged in sucessfully"
              }
              cb(null, response)
              // doctor.updateAttribute('socketId', data.socketId, function (err, result) {
              //   if (err) {
              //     let errormessage = {
              //       error: true,
              //       message: "Something Weng Wrong"
              //     }
              //     cb(null, errormessage);
              //   }
              //   else {
              //     console.log('result', result)
              //     let successmessage = {
              //       error: false,
              //       result: result,
              //       message: 'SocketId added Successfully'
              //     }
              //     cb(null, successmessage);
              //   }
              // })
            })
          }
          else {
            Individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + data.userId } }, function (err, individual) {
              // individual.updateAttribute('socketId', data.socketId, function (err, result) {
              //   console.log('resultttt', result)
              //   let successmessage = {
              //     error: false,
              //     result: result,
              //     message: 'SocketId added Successfully'
              //   }
              //   cb(null, successmessage);
              // })
              socket.to(data.socketId).emit("loginByScanner", {
                individualId: individual.individualId
              });

              let response = {
                error: false,
                message: "Logged in sucessfully"
              }
              cb(null, response)
            })
          }
        }
        else {
          let errMessage = {
            error: true,
            message: 'User not Exists'
          }
          cb(null, errMessage)
        }
      }
    })
  }
  /************************************ END OF LOGINBYSCANNER **************/

  /**************************** UPDATE USER STATUS*********************/
  User.remoteMethod('updateUserStatus', {
    http: { path: '/updateUserStatus', verb: 'post' },
    accepts: { arg: 'data', type: 'object', required: true, http: { source: 'body' } },
    returns: { arg: 'result', type: 'string' },
  });
  /************************* API LOGIC *************************/
  User.updateUserStatus = function (data, cb) {
    console.log('user Detail....', data.userId, data.socketId, data.availability)

    const Individual = app.models.individual;
    const Doctor = app.models.doctor;

    User.findOne({ where: { userId: data.userId } }, function (err, exists) {

      if (err) {
        let errormessage = {
          error: true,
          message: "Something Weng Wrong"
        }
        cb(null, errormessage);
      }
      else {


        if (exists != null && Object.keys(exists).length != 0) {

          if (exists.role == 'individual') {

            Individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + data.userId } }, function (err, individual) {
              if (err) {
                let errormessage = {
                  error: true,
                  message: "Something Went Wrong",
                  err: err
                }
                cb(null, errormessage);
              } else {
                individual.updateAttributes({ socketId: data.socketId, availability: data.availability }, function (err, result) {
                  console.log('resultttt', result)
                  let successmessage = {
                    error: false,
                    result: result,
                    message: 'User Status Updated Successfully'
                  }
                  cb(null, successmessage);
                })
              }
            })


          } else {

            Doctor.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + data.userId } }, function (err, doctor) {
              console.log('doctor....', data)
              if (err) {
                let errormessage = {
                  error: true,
                  message: "Something Went Wrong",
                  err: err
                }
                cb(null, errormessage);
              } else {
                doctor.updateAttributes({ socketId: data.socketId, availability: data.availability }, function (err, result) {
                  console.log('result', result)
                  let successmessage = {
                    error: false,
                    result: data,
                    message: 'User Status Updated Successfully'
                  }
                  cb(null, successmessage);
                })
              }
            })
          }
        } else {
          let errMessage = {
            error: true,
            message: 'User not Exists'
          }
          cb(null, errMessage)
        }
      }
    })
  }

  /******************************************  ENDS  ************************************************* */



  /********************** Individuals Edge LOGIN* STARTS ************************** */
  User.remoteMethod('edgeLogin', {
    http: { path: '/edgeLogin', verb: 'post' },
    accepts: { arg: 'logindata', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'string' },
  });

  User.edgeLogin = function (logindata, cb) {
    console.log('data', logindata)
    // const Individual = app.models.individual;

    User.findOne({ where: { and: [{ phoneNumber: logindata.phoneNumber }, { role: logindata.role }] } }, function (err, exists) {
      console.log('user existence', exists, err);
      if (!err) {
        if (exists != null && Object.keys(exists).length != 0) {
          var otpresponse = {
            err: false,
            message: 'OTP sent to registered number'
          }
          cb(null, otpresponse)
        }
        else {
          var otpresponse = {
            err: true,
            message: 'This is not a registered Individual'
          }
          cb(null, otpresponse)
        }
      }
      else {
        var otpresponse = {
          err: true,
          message: 'Something went wrong'
        }
        cb(null, otpresponse);
      }
      // cb(null,exists)
      // if (exists != null && Object.keys(exists).length != 0) {

      //   //user exists 
      //   if (logindata.role == 'doctor') {
      //     // send otp
      //     var otpresponse = {
      //       err: true,
      //       message: 'This is not a registered Indididual'
      //     }
      //     cb(null, otpresponse)
      //   }
      //   else {
      //     Individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + exists.userId } }, function (err, individual) {
      //       console.log('in', individual)

      //       //send otp
      //       var otpresponse = {
      //         err: false,
      //         message: 'OTP sent to registered number'
      //       }
      //       cb(null, otpresponse)
      //       // sendOtp(logindata.phoneNumber).then(function (result) {
      //       //   console.log('RRESULT', result)
      //       //   if (result.type == 'success') {
      //       //     var otpresponse = {
      //       //       err: false,
      //       //       message: 'OTP sent to registered number'
      //       //     }
      //       //     cb(null, otpresponse)
      //       //   }
      //       //   else {
      //       //     var otperror = {
      //       //       error: true,
      //       //       message: 'Otp sending falied',
      //       //       details: result
      //       //     }
      //       //     cb(null, otperror)
      //       //   }
      //       // }).catch(err => {
      //       //   cb(null, err)
      //       // })

      //     })
      //   }

      // }
      // else {
      //   //user not registered
      //   let errMessage = {
      //     error: true,
      //     message: 'User not Registered'
      //   }
      //   cb(null, errMessage)
      // }
    })
  }



  /************************************VERIFY OTP STARTS *********************************/

  User.remoteMethod('edgeverifyotp', {
    http: { path: '/edgeverifyotp', verb: 'post' },
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' },
  });


  // d
  User.edgeverifyotp = function (data, cb) {
    const Individual = app.models.individual;
    verifyOtp(data.phoneNumber, data.otp).then(function (result) {
      if (result) {

        Individual.findOne({ where: { phoneNumber: data.phoneNumber } }, function (err, individual) {
          console.log('in', individual)

          //send otp
          var userdata = {
            err: false,
            individualId: individual,
            message: 'Got user successfully'
          }
          cb(null, userdata)
        })
      }
      else {
        var otperror = {
          error: true,
          message: 'Incorrect OTP ',
        }
        cb(null, otperror)
      }
    })
      .catch(err => {
        console.log(err)
        var otperror1 = {
          error: true,
          message: 'OTP verification failed',
        }
        cb(null, otperror1)
      })

  }

  /********************************* DOCTOR WEB LOGIN  *****************************************************/
  User.remoteMethod('doctorWebLogin', {
    http: { path: '/doctorWebLogin', verb: 'post' },
    description: "Doctor's Web Login",
    accepts: { arg: 'webdata', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' }
  });
  User.doctorWebLogin = function (webdata, cb) {
    console.log(webdata)
    const Doctor = app.models.doctor;
    User.findOne({ where: { and: [{ phoneNumber: webdata.phoneNumber }, { role: webdata.role }] } }, function (err, exists) {
      console.log('user existence', exists)
      if (exists != null && Object.keys(exists).length != 0) {
        //user exists 
        if (webdata.role == 'doctor') {
          console.log(exists.userId)
          Doctor.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + exists.userId } }, function (err, doctor) {
            console.log('doctor', doctor)
            // send otp
            var otpresponse = {
              err: false,
              message: 'OTP sent to registered number'
            }
            cb(null, otpresponse)

          })
        }
      } else {
        let errMessage = {
          error: true,
          message: 'User not Registered'
        }
        cb(null, errMessage)
      }
    })
  }
  /******************************************************************************************************* ***/

  /********************************************** USER VERIFY NUMBER  AT TIME OF REGISTRATION ******************************************************** */
  User.remoteMethod('verifynumber', {
    http: { path: '/verifyNumber', verb: 'post' },
    accepts: { arg: 'phoneNumber', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any', root: true },
  });

  User.verifynumber = function (phoneNumber, cb) {
    console.log('phonenumber', phoneNumber)
    User.findOne({ where: { phoneNumber: phoneNumber.phoneNumber } }, function (err, existence) {
      console.log('retruende result', existence)
      console.log('err', err)
      if (!err) {
        if (existence != null && Object.keys(existence).length != 0) {
          let response = {
            error: false,
            message: "User Already Registered!Please Login"
          }
          cb(null, response);
        }
        else {
          let response = {
            error: false,
            message: "User Not Registered"
          }
          cb(null, response)
        }
      }
      else {
        let response = {
          error: true,
          message: "Something went wrong"
        }
        cb(null, response);
      }
    })
  }
  /********************************************************************************************************** */
  /** Econsult APIS **/
  /** API to generate tokens **/
  User.remoteMethod('twilloToken', {
    http: { path: '/twilloToken', verb: 'get' },
    accepts: { arg: 'username', type: 'string' },
    returns: { arg: 'result', type: 'any', root: true },
  });

  User.twilloToken = function (username, cb) {
    // Set the Identity of this token
    accessToken.identity = username;

    // Grant access to Video
    var grant = new VideoGrant();
    grant.room = 'cool room';
    accessToken.addGrant(grant);

    // Serialize the token as a JWT
    var jwt = accessToken.toJwt();
    console.log(jwt);
    let response = {
      token: jwt
    }
    cb(null, response);
  }

}


















