'use strict';

const Composer = require('../lib/composer.js');
const app = require('../../server/server');

const vaccineList = require('../../vaccine.json');       //GET VACCINE LIST JSON FILE

module.exports = function (individual) {

  // HIDE UNUSED REMORE METHODS
  const enabledRemoteMethods = ["findById", "updateProfile", "deleteById", "find", "filterdoctor", 'callinitiation', "callactions", "getallergies", "getsurgery", "getMedicalHistory", "getimmunization", "allergieslist", "filterallergies", "diseaseslist", "relations", "medicalconditions", "vaccinegroup", "currentsymptom", "filterVaccine"];
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
              console.log('error', err)
              let successmessage = {
                error: false,
                result: result,
                message: 'Family member added Successfully'
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

  individual.remoteMethod('getfamily', {
    http: { path: '/getfamily', verb: 'get' },
    description: "add family members",
    accepts: { arg: 'userId', type: 'string' },
    returns: { arg: 'result', type: 'any' },
  });


  individual.getfamily = function (userId, cb) {
    console.log(userId);
    // individual.find({ include: "userId" }, function (err, res) {
    //   // console.log('response',res)
    //   cb(null, res);
    // })
    individual.findOne({ where: { userId: 'resource:io.mefy.commonModel.User#' + userId } }, function (err, user) {
      if (user != null && Object.keys(user).length != 0) {
        ProcessArray(user.family).then(users => {
          let result = {
            error: false,
            family: users,
            message: 'family member get successfull'
          }
          cb(null, result)
        })
          .catch(err => {
            let errors = {
              error: true,
              message: 'Error in fetching data'
            }
            cb(null, errors);
          })
      } else {
        let errors = {
          error: true,
          message: 'Error in fetching data'
        }
        cb(null, errors);
      }
    })
  }


  async function ProcessArray(array) {
    // console.log('INSIDE PROCESS ARRAY', array)
    const x = [];
    for (const subs of array) {
      // console.log('substitute data',subs)
      await Promise.all([substitutedata(subs)]).then(function (values) {
        // console.log('RETUNED VALUESSSS',values);
        x.push(values[0]);
      });
    }
    return x;
  }

  async function substitutedata(item) {
    // console.log('INSIDE SUBSTITIUE FUNCTION', item)
    return new Promise((resolve) => {
      individual.findOne({ where: { individualId: item.individual.split('#')[1] } }, function (err, medicine) {
        // console.log('INSIDE MEDICINE FIND METHOD', medicine[0])
        console.log('mdecine', medicine)
        resolve(medicine);
      })
    })
  }

  /*************************************** ENDS ********************************************** */

  /*********************************** SEARCH DOCTOR ON THE BASIS OF NAME,SPECIALITY,ONLINE ***************************** */

  individual.remoteMethod('filterdoctor', {
    http: { path: '/filterdoctor', verb: 'get' },
    description: "filter doctor on the basis of name,speciality,online/offline",
    accepts: [
      { arg: 'name', type: 'string', required: false },
      { arg: 'speciality', type: 'string', required: false },
      { arg: 'availability', type: 'string', required: false }
    ],
    returns: { arg: 'result', type: 'any' },
  });

  // logic implementation
  individual.filterdoctor = function (name, speciality, availability, cb) {
    console.log('name:' + name, 'speciality:' + speciality, 'availability' + availability);
    const Doctor = app.models.doctor;
    if (name != undefined && availability == undefined && speciality == undefined) {
      // search docotor by name  
      // like not working
      Doctor.find({ where: { name: name } }, function (err, list) {
        console.log('name  filter', list);
        console.log('error', err)
        let result = {
          error: false,
          result: list,
          message: 'List get successfully'
        }
        cb(null, result);
      })
    }
    else if (name == undefined && availability != undefined && speciality == undefined) {
      // search online doctors
      Doctor.find({ where: { availability: 'Online' } }, function (err, list) {
        console.log('online  filter', list);
        console.log('error', err)
        let result = {
          error: false,
          result: list,
          message: 'List get successfully'
        }
        cb(null, result);
      })
    }
    else if (name == undefined && availability == undefined && speciality != undefined) {
      // search doctor by speciality
      //  inq not working  
      Doctor.find({ where: { speciality: { inq: [speciality] } } }, function (err, list) {
        console.log('speciality  filter', list);
        console.log('error', err)
        let result = {
          error: false,
          result: list,
          message: 'List get successfully'
        }
        cb(null, result);
      })
    }
    else if (name != undefined && availability != undefined && speciality == undefined) {
      //    //search doctor by availability and name 
      Doctor.find({ where: { and: [{ availability: 'Online' }, { name: name }] } }, function (err, list) {
        console.log('availabilty and name', list);
        console.log('error', err);
        let result = {
          error: false,
          result: list,
          message: 'List get successfully'
        }
        cb(null, result);
      })
    }
    //  else if(){
    //   //  search by availability  and  specilaity
    //  }
    //  else if(){
    //    //serach by name  and speciality
    //  }
    //  else if(){
    //    // search by all name,availabilty and specility
    //  }


  }
  /******************************************** ENDS ********************************************************************** */


  /********************************************* INDVIDUAL INITIATES VIDEO CALL ********************************************* */

  individual.remoteMethod('callinitiation', {
    http: { path: '/callinitiation', verb: 'post' },
    description: " video call initiation api ",
    accepts:
      // { arg: 'doctorId', type: 'string', required: false },
      // { arg: 'individualId', type: 'string', required: false },
      // { arg: 'token', type: 'string', required: false },
      { arg: 'data', type: 'obj', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' }
  });

  individual.callinitiation = function (data, cb) {
    console.log('data captured', data.doctorId, data.individualId, data.token);
    const doctor = app.models.doctor;
    doctor.findOne({ where: { and: [{ doctorId: data.doctorId }, { availability: 'Online' }] } }, function (err, result) {
      console.log('error:::' + err, 'result:::' + result);
      if (result != null && Object.keys(result).length != 0) {
        //doctor is online emit socket event
        var socket = app.io;
        socket.to(result.socketId).emit("call", {
          individualId: data.individualId,
          token: data.token
        });
        let response = {
          error: false,
          message: 'Call initiated'
        }
        cb(null, response);
      }
      else {
        //doctor is offline
        let response = {
          error: true,
          message: 'User is busy on another call'
        }
        cb(null, response);
      }
    })
  }

  /***************************************************** ENDS ********************************************* */

  /*************************************************  VIDEO CALL ACCEPT /REJECT/CALL_END BY INDIVIDUAL *********************************************** */
  individual.remoteMethod('callactions', {
    http: { path: '/callactions/:individualId/:doctorId/:token', verb: 'get' },
    description: "  accept/reject/callend actions ",
    accepts: [
      { arg: 'actions', type: 'string', required: true },
      { arg: 'individualId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'doctorId', type: 'string', required: true, http: { source: 'path' } },
      { arg: 'token', type: 'string', required: true, http: { source: 'path' } },
    ],
    returns: { arg: 'result', type: 'any' }
  });


  individual.callactions = function (actions, individualId, doctorId, token, cb) {
    console.log('actions:' + actions, 'data:' + token, individualId, doctorId);
    const doctor = app.models.doctor;
    var socket = app.io;

    doctor.findOne({ where: { doctorId: doctorId } }, function (err, result) {
      if (result != null && Object.keys(result).length != 0) {
        if (actions == 'accept') {
          //acept event emit
          socket.to(result.socketId).emit("accept", {
            individualId: data.individualId,
            message: 'Call accepted',

          });
          let response = {
            error: false,
            message: 'Call accepted'
          }
          cb(null, response);
        }
        else if (actions == 'reject') {
          // reject event emit
          socket.to(result.socketId).emit("reject", {
            individualId: data.individualId,
            message: 'Call rejected'
          });
          let response = {
            error: false,
            message: 'Call rejected'
          }
          cb(null, response);
        }
        else if (actions == 'call_end') {
          //end call event emit
          socket.to(result.socketId).emit("call_end", {
            individualId: data.individualId,
            message: 'Call ended'
          });
          let response = {
            error: false,
            message: 'Call ended'
          }
          cb(null, response);
        }
      }
      else {
        cb(null, 'user doesnot exists')
      }
    })

  }
  /************************************************* ENDS *************************************************** */



  /********************************************** GET INDV ALLERGIES LIST *******************************************/

  individual.remoteMethod('getallergies', {
    http: { path: '/allergy', verb: 'get' },
    description: "GET ALERGIES OF INDIVIDUAL",
    accepts: [
      { arg: 'individualId', type: 'string', required: true }
    ],
    returns: { arg: 'result', type: 'any' }
  });

  individual.getallergies = function (individuaId, cb) {
    const allergies = app.models.allergies;
    allergies.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individuaId } }, function (err, res) {
      console.log('kjh', res)
      if (err) {
        let result = {
          error: true,
          message: "something went wrong"
        }
        cb(null, result)
      }
      else {
        let result = {
          error: false,
          result: res,
          message: "Allergy list get "
        }
        cb(null, result)
      }
    })
  }

  /****************************************** ENDS **************************************************************** */


  /********************************************** GET INDV Surgery LIST *******************************************/

  individual.remoteMethod('getsurgery', {
    http: { path: '/surgery', verb: 'get' },
    description: "SURGERY OF INDIVIDUAL",
    accepts: [
      { arg: 'individualId', type: 'string', required: true }
    ],
    returns: { arg: 'result', type: 'any' }
  });

  individual.getsurgery = function (individualId, cb) {
    const surgical = app.models.surgical;
    surgical.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individualId } }, function (err, res) {
      console.log('kjh', res)
      if (err) {
        let result = {
          error: true,
          message: "something went wrong"
        }
        cb(null, result)
      }
      else {
        let result = {
          error: false,
          result: res,
          message: "surgical list get "
        }
        cb(null, result)
      }
    })
  }
  /****************************************** ENDS **************************************************************** */

  /*******************GET MEDICAL HISTORY BY INDIVIDUALID************************* */
  individual.remoteMethod('getMedicalHistory', {
    http: { path: '/getMedicalHistory', verb: 'get' },
    description: "Get all medical history by Individual id",
    accepts: { arg: 'individualId', type: 'string', required: true },
    returns: { arg: 'result', type: 'any' }

  });
  individual.getMedicalHistory = function (individualId, cb) {
    console.log('individualId', individualId)
    const Medical = app.models.medical
    Medical.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individualId } }, function (err, response) {
      if (err) {
        let result = {
          error: true,
          message: "something went wrong"
        }
        cb(null, result)
      }
      else {
        if (response != null && Object.keys(response).length != 0) {
          console.log('response', response)
          let medicalList = {
            error: false,
            result: response,
            message: "All Medical History of Individual"
          }
          cb(null, medicalList)
        }

        else {
          cb(null, 'Not Found')
        }
      }
    })
  }

  /****************************************** ENDS **************************************************************** */



  /********************************************** GET INDV Immunization LIST *******************************************/

  individual.remoteMethod('getimmunization', {
    http: { path: '/immunization', verb: 'get' },
    accepts: [
      { arg: 'individualId', type: 'string', required: true }
    ],
    returns: { arg: 'result', type: 'any' }
  });

  individual.getimmunization = function (individuaId, cb) {
    const immunization = app.models.immunization;
    immunization.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individuaId } }, function (err, res) {
      console.log('kjh', res)
      if (err) {
        let result = {
          error: true,
          message: "something went wrong"
        }
        cb(null, result)
      }
      else {
        let result = {
          error: false,
          result: res,
          message: "immunization list get "
        }
        cb(null, result)
      }
    })
  }

  /****************************************** ENDS **************************************************************** */

  /*************************************************  ALLERGIES  LIST *********************************************** */

  individual.remoteMethod('allergieslist', {
    http: { path: '/allergies', verb: 'get' },
    description: "GET LIST OF ALL ALLERGIES",
    returns: { arg: 'result', type: 'any' }
  });

  individual.allergieslist = function (cb) {
    let allergiesarray = [
      "Medicine",
      "Food",
      "Dust",
      "Skin",
      "Insect Sting",
      "Cockraches",
      "Dog",
      "Cat",
      "Eye",
      "Hey Fever",
      "Latex",
      "Mold",
      "Sinusitis"
    ]
    //*** */
    cb(null, allergiesarray)
  }

  /*********************************************************** ENDS ***************************************************** */

  /*******************************************  FILTER ALLERGIES   ************************************************* */

  individual.remoteMethod('filterallergies', {
    http: { path: '/sortallergies', verb: 'get' },
    description: "GET SORTED ALLERGIES LIST ACCORDING TO TYPE",
    accepts:
      { arg: 'type', type: 'string', required: true },
    returns: { arg: 'result', type: 'any' }
  })

  individual.filterallergies = function (type, cb) {
    console.log('type', type)
    if (type == 'Food') {
      console.log('inside food if');
      let foodarray = ["Curd", "Egg", "Milk", "Wheat", "Corn", "Peanut", "Soy", "Garlic", "Chilli", "Fruit"];
      cb(null, foodarray);
    }
    else if (type == 'Medicine') {
      // get list of medicine form medicinemaster of pharmacy
    }
    else {
      cb(null, [])
    }

  }
  /************************************************** ENDS ******************************************************** */
  /*************************************************  DISEASES  LIST *********************************************** */

  individual.remoteMethod('diseaseslist', {
    http: { path: '/diseaseslist', verb: 'get' },
    description: "GET LIST OF ALL DISEASES",
    returns: { arg: 'result', type: 'any' }
  });

  individual.diseaseslist = function (cb) {
    let diseasesarray = [
      "Respiratory",
      "Cardiovascular",
      "Disabilities",
      "Cancer",
      "Gastrointestinal system",
      "Hepatic diseases",
      "Nervous system",
      // Respiratory system
      // Cardiovascular system,
      "Auto immune conditions",
      "Oncology",
      "Metabolic disorders",
      "Endocrinology",
      "Allergies",
      "Dermatological conditions",
      "Psychiatric diseases",
      "Musculoskeletal system",
      "Rheumatology",
      "Genitourinary system",
      "Gynecology and Obstetric history",
      "Sexual wellbeing",
      "ENT",
      "Ophthalmology"
      // Disabilities
    ]
    cb(null, diseasesarray)
  }

  /*********************************************************** ENDS ***************************************************** */





  /*************************************************  RELATIONSHIP  LIST *********************************************** */

  individual.remoteMethod('relations', {
    http: { path: '/relationship', verb: 'get' },
    description: "GET LIST OF ALL RELATIONSHIP",
    returns: { arg: 'result', type: 'any' }
  });

  individual.relations = function (cb) {
    let relationsarray = [
      "Mother",
      "Father",
      "Maternal Grandfather",
      "Maternal Grandmother",
      "Paternal Grandfather",
      "Paternal Grandfather",
      "Brother",
      "Sister",
      "Spouse/Partner"
    ]
    cb(null, relationsarray)
  }

  /*********************************************************** ENDS ***************************************************** */


  /*************************************************  SURGERY  LIST *********************************************** */

  individual.remoteMethod('surgerylist', {
    http: { path: '/surgerylist', verb: 'get' },
    description: "GET LIST OF ALL SURGERY",
    returns: { arg: 'result', type: 'any' }
  });

  individual.surgerylist = function (cb) {
    let surgeryarray = [
      "hernia repair",
      "stomach surgery",
      "hemorrhoids",
      "removal of the appendix",
      "removal of the gall bladder",
      "breast surgery",
      "colonoscopy"
    ]
    cb(null, surgeryarray)
  }

  /*********************************************************** ENDS ***************************************************** */

  /*************************************************  MEDICAL CONDITIONS  LIST *********************************************** */

  individual.remoteMethod('medicalconditions', {
    http: { path: '/medicalconditions', verb: 'get' },
    description: "GET LIST OF ALL MEDICAL CONDITIONS",
    returns: { arg: 'result', type: 'any' }
  });

  individual.medicalconditions = function (cb) {
    let medicalarray = [
      "Heart disease",
      "High blood pressure",
      "Diabetes",
      "Stroke",
      "Dementia",
      "Mental illness",
      "Osteoporosis"
    ]
    cb(null, medicalarray)
  }

  /*********************************************************** ENDS ***************************************************** */

  /*************************************************  VACCINES AGE GROUP LIST *********************************************** */

  individual.remoteMethod('vaccinegroup', {
    http: { path: '/vaccinegroup', verb: 'get' },
    description: "GET LIST OF VACCINE AGE GROUP",
    returns: { arg: 'result', type: 'any' }
  });

  individual.vaccinegroup = function (cb) {
    let vaccinetype = [
      "Birth",
      "0 - 6 Months",
      "6 - 9 Months",
      "1 Year",
      "7 Year",
      "9 Year"
    ]
    cb(null, vaccinetype)
  }

  /*********************************************************** ENDS ***************************************************** */


  /************************************************** FILTER VACCINES BY AGEGROUP ********************************************** */

  individual.remoteMethod('filterVaccine', {
    http: { path: '/filterVaccine', verb: 'get' },
    description: "LIST VACCINE ACCORDING TO AGEGROUP",
    accepts: { arg: 'ageGroup', type: 'string', required: true },
    returns: { arg: 'result', type: 'any' }
  });

  individual.filterVaccine = function (ageGroup, cb) {
    console.log('vaccinelist', vaccineList);

    let vaccineArray = vaccineList.filter(instance => instance.ageGroup == ageGroup);   //FILTER VACCINE ACCORDING TO AGEGROUP
    console.log('filtered array list', vaccineArray);

    cb(null, vaccineArray)
  }

  /****************************************************** ENDS ***************************************************************** */


  /*************************************************  CURRENT COMPLAINT LIST *********************************************** */

  individual.remoteMethod('currentsymptom', {
    http: { path: '/currentsymptom', verb: 'get' },
    description: "GET LIST OF CURRENT COMPLAINT SYMPTOM",
    returns: { arg: 'result', type: 'any' }
  });

  individual.currentsymptom = function (cb) {
    let currentsymptoms = [
      "Coughing",
      " A tight sensation in the chest",
      " Being out of breath regularly",
      "severe headaches and anxiety, chest pain and an irregular heartbeat",
      "High Blood Pressure",
      "Joint pain, tenderness and stiffness",
      "Restricted movement of joints",
      " Inflammation in and around the joints",
      " Finding an unexpected lump",
      " Unexplained weight loss",
      " Unexplained blood in the stool, urine, when coughing or when vomiting",
      "A sore throat",
      "Headaches",
      "A runny or blocked nose",
      "Fatigue",
      "Aches and pains in your chest",
      "Difficulty remembering recent events",
      "Problems in conversation – struggling to follow along or to find the right words",
      "Difficulty judging distance",
      "Forgetting where you are or what date it is",
      "Difficulty swallowing (and sometimes excessive drooling",
      "A weakened grip, usually first noticed in one hand",
      "Small twitches and flickers of movement, known as ‘fasciculations",
      "Difficulty speaking or slurred speech, known as ‘dysarthria",
      "Blurred vision",
      "Muscle stiffness",
      "Balance problems",
      "Difficulty walking",
      "Fatigue",
      "Constant, dull bone pain",
      "Shooting pain that travels along or across the body",
      "Numbness and tingling",
      "Loss of movement in a part of the body",
      "Involuntary shaking of particular parts of the body (tremor)",
      "Slow movement",
      "Stiff and inflexible muscles",
      " unable to smile and their face may have dropped on one side, with their",
      "mouth or eye drooping",
      "unable to lift both arms and keep them there due to weakness in one arm",
      "slurred or garbled speech",
      "Shortness of breath",
      "Feeling sick",
      "Blood in your urine",
      "Swollen ankles, feet or hands",
      "Tiredness",
      "Pain, swelling and tenderness in one of your legs",
      " A heavy ache in the affected area",
      "Red skin – particularly at the back of your leg, below the knee",
      "Warm skin in the area of the clot",
      "A mild fever",
      "sharp stabbing pains every now and then",
      "burning and tingling feeling",
      "high temperature",
      "Not Well",
      "extremely itchy"
    ]


    cb(null, currentsymptoms)
  }

  /*********************************************************** ENDS ***************************************************** */


  individual.observe('loaded', function (context, next) {
    const Individual = app.models.individual;

    // FETCH INDIVIDUAL DETAILS
    // console.log('contextdata', context.data.family.individualId)
    if(context.data.family.length!=0){
      ProcessArray(context.data.family).then(users => {
        console.log('usrs',users)
        context.data.families=users;
        next();
        // let result = {
        //   error: false,
        //   family: users,
        //   message: 'family member get successfull'
        // }
        // cb(null, result)
      })
    }
    else{
      next();

    }
   
    // if (context.data.individualId) {
    //   individual.findOne({ where: { individualId: context.data.individualId.includes('#') ? context.data.individualId.split('#')[1] : context.data.individualId } }, function (err, indv) {
    //     console.log(indv + 'err' + err);
    //     context.data.individuals = indv;
    //     next();
    //   })
    // }
    // else {
    //   next();
    // }
  })

};
  // individual.find({where:{family:{inq:['Father']}}},function(err,res){
// individual.find({
//   where: { userId: 'resource:io.mefy.commonModel.User#' + userId },
//   include: {
//     relation: "family",
//     scope: {
//       include: {
//         relation: "individual"

//       },
//     }
//   }
// }, function (err, res) {
//   console.log('response', res)
//   cb(null, res)
// })

// {"name":"dev","phoneNumber":"823894944","city":"jsr","dob":"3-23-1990","gender":"male","relation":"papa"}
// "family":{
//   "type":"hasOne",
//   "model":"individual",
//   "foreignKey":"individual",
//   "through": "individual"

// }