'use strict';

const Composer = require('../lib/composer.js');
const app = require('../../server/server');

module.exports = function (prescription) {
  Composer.restrictModelMethods(prescription);

  // HIDE UNUSED REMOTE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find", "create", "prescriptionbyindividualId"];
  prescription.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      prescription.disableRemoteMethodByName(methodName);
    }
  });

  /*********************************************** CREATE PRESCRIPTION ******************************************* */

  prescription.remoteMethod('createpres', {
    http: { path: '/create', verb: 'post' },
    description: "create prescription",
    accepts: { arg: 'data', type: 'obj', http: { source: 'body' } },
    //doctorId,individualId,advice,lifestyle,medicine,diagnosis,instruction,recommended
    returns: { arg: 'result', type: 'string' },
  });

  prescription.createpres = function (data, cb) {
    // console.log('data,', data);
    var dataArray = [];
    prescription.create({ doctorId: data.doctorId, individualId: data.individualId }, function (err, pres) {
      // console.log('err', err)
      // console.log('pres', pres)
      if (!err) {

        //form an array of data then send to generate ids
        if (data.medicine && data.medicine.length != 0) {
          console.log('inside data medicine')
          let data1 = {
            type: "medicine",
            medd: data.medicine
          }
          dataArray.push(data1);
        }
        if (data.diagnosis && data.diagnosis.length != 0) {
          console.log('inside data diagnosis')
          let data2 = {
            type: "diagnosis",
            diag: data.diagnosis
          }
          dataArray.push(data2)
        }
        if (data.advice && data.advice.length != 0) {
          console.log('inside data advice')
          let data3 = {
            type: "advice",
            adv: data.advice
          }
          dataArray.push(data3);
        }
        if (data.lifestyle && data.lifestyle.length != 0) {
          console.log('inside data lifestyle')
          let data4 = {
            type: "lifestyle",
            life: data.lifestyle
          }
          dataArray.push(data4);
        }
        if (data.instruction && data.instruction.length != 0) {
          console.log('inside data instruction')
          let data5 = {
            type: "instructions",
            ins: data.instruction
          }
          dataArray.push(data5);
        }
        if (data.recommended && data.recommended.length != 0) {
          console.log('inside data recommended')
          let data6 = {
            type: "recommended",
            recomm: data.recommended
          }
          dataArray.push(data6);
        }
        console.log('data array', dataArray)
        // GENERATE IDS THEN UPDATE PRESCRIPTION
        generateIds(dataArray).then(function (values) {

          console.log('GenerateIds returned value', values)
          pres.updateAttributes({
            medicineId: values.medicineId != '' ? values.medicineId : null, adviceId: values.adviceId != '' ? values.adviceId : null,
            lifeStyleId: values.lifestyleId != '' ? values.lifestyleId : null, diagnosisId: values.diagnosisId != '' ? values.diagnosisId : null,
            specificInstructionId: values.instructionId != '' ? values.instructionId : null, recommendedId: values.recommendedId != '' ? values.recommendedId : null

          }, function (err, created) {
            console.log('PRESCRIPTION UPDATE ERROR', err);
            console.log('PRESCRIPTION UPDATED SUCCESS', created);
            if (!err) {
              let response = {
                error: false,
                result: created,
                message: 'Prescription created successfully'
              }
              cb(null, response)
            }
          })
        }).catch(err => {
          console.log(err);
          let error = {
            error: true,
            message: 'Prescription not created'
          }
          cb(null, error)
        });
      }
    })
  }

  // RETURN GENERATED IDS
  async function generateIds(dataArray) {
    console.log('INSIDE GENERATE IDS', dataArray);
    let x = {};
    for (const instance of dataArray) {
      console.log('INSIDE FOR LOOP', instance)
      await Promise.all([aggregate(instance)]).then(function (values) {
        console.log('AGGRGATE FUNCTION VALUE', values);
        console.log(values[0])
        if (values[0].hasOwnProperty("medicineId")) {
          x.medicineId = values[0].medicineId;
        }
        else if (values[0].hasOwnProperty("diagnosisId")) {
          x.diagnosisId = values[0].diagnosisId
        }
        else if (values[0].hasOwnProperty("recommendedId")) {
          x.recommendedId = values[0].recommendedId
        }
        else if (values[0].hasOwnProperty("lifestyleId")) {
          x.lifestyleId = values[0].lifestyleId
        }
        else if (values[0].hasOwnProperty("instructionId")) {
          x.instructionId = values[0].instructionId
        }
        else if (values[0].hasOwnProperty("adviceId")) {
          x.adviceId = values[0].adviceId
        }
      })
    }
    return x;
  }

  // GENERATE SINGLE IDS
  async function aggregate(instance) {
    console.log('INSIDE AGGREGATE FUNCTION', instance);
    const medicine = app.models.prescribeMedicine;
    const advice = app.models.advice;
    const lifestyle = app.models.lifeStyle;
    const instruction = app.models.instruction;
    const diagnosis = app.models.diagnosis;
    const recommended = app.models.recommended;
    return new Promise((resolve) => {
      if (instance.type == "medicine") {
        medicine.create([instance.medd], function (err, med) {
          console.log('err', err);
          console.log('MED', med)
          let datasent = {
            medicineId: med[0][0].prescribeMedicineId,

          }
          resolve(datasent)
        })
      }
      else if (instance.type == "diagnosis") {
        diagnosis.create([instance.diag], function (err, diag) {
          console.log('err', err);
          console.log('DIAG', diag[0][0])
          let datasent = {
            diagnosisId: diag[0][0].diagnosisId,

          }
          resolve(datasent)
        })
      }
      else if (instance.type == "advice") {
        advice.create([instance.adv], function (err, adv) {
          console.log('err', err);
          console.log('ADV', adv)
          let datasent = {
            adviceId: adv[0][0].adviceId,

          }
          resolve(datasent)
        })
      }
      else if (instance.type == "recommended") {
        recommended.create([instance.recomm], function (err, rec) {
          console.log('err', err);
          console.log('REC', rec)
          let datasent = {
            recommendedId: rec[0][0].recommendedId,

          }
          resolve(datasent)
        })
      }
      else if (instance.type == "lifestyle") {
        lifestyle.create([instance.life], function (err, life) {
          console.log('err', err);
          console.log('LIFE', life)
          let datasent = {
            lifestyleId: life[0][0].lifeStyleId,

          }
          resolve(datasent)
        })
      }
      else if (instance.type == "instructions") {
        instruction.create([instance.ins], function (err, ins) {
          console.log('err', err);
          console.log('Ins', ins)
          let datasent = {
            instructionId: ins[0][0].instructionId,

          }
          resolve(datasent)
        })
      }
    })

  }
  /**************************************************** ENDS **************************************************** */


  /********************************************************* GET PRESCRIPTION BY INDIVIDUALID ********************* */

  prescription.remoteMethod('prescriptionbyindividualId', {
    http: { path: '/individualprescription', verb: 'get' },
    description: "get prescription by individalId",
    accepts: { arg: 'individualId', type: 'string' },
    returns: { arg: 'result', type: 'any' },
  });

  // LOGIC FOR GETTING DETAILS
  prescription.prescriptionbyindividualId = function (individualId, cb) {
    prescription.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individualId } }, function (err, list) {

      fetchDetail(list).then(function (result) {
        // console.log('FETCH DETAIL RETURNED VALUE', result);
        let response = {
          error: false,
          result: result,
          message: 'Prescription detail get successfull'
        }
        cb(null, response)
      }).catch(err => {

      })
    })
  }

  // FORM  DATA IN A WAY TO FETCH DETAILS 
  async function fetchDetail(preslist) {
    // console.log('INSIDE FETCHDETAIL FUNCTION', preslist)
    let dataarray = [];
    for (const instance of preslist) {
      // console.log('instance',instance)
      let fulldata = [];

      if (instance.doctorId) {
        let data1 = {
          doctorId: instance.doctorId
        }
        fulldata.push(data1)
      }
      if (instance.medicineId) {
        let data2 = {
          medicineId: instance.medicineId
        }
        fulldata.push(data2)
      }
      if (instance.adviceId) {
        let data3 = {
          adviceId: instance.adviceId
        }
        fulldata.push(data3)
      }
      if (instance.recommendedId) {
        let data4 = {
          recommendedId: instance.recommendedId
        }
        fulldata.push(data4)
      }
      if (instance.specificInstructionId) {
        let data5 = {
          specificInstructionId: instance.specificInstructionId
        }
        fulldata.push(data5)
      }
      if (instance.lifeStyleId) {
        let data6 = {
          lifeStyleId: instance.lifeStyleId
        }
        fulldata.push(data6)
      }
      if (instance.diagnosisId) {
        let data7 = {
          diagnosisId: instance.diagnosisId
        }
        fulldata.push(data7)
      }
      if (instance.prescriptionId) {
        let data8 = {
          prescriptionId: instance.prescriptionId
        }
        fulldata.push(data8)
      }

      await getDetails(fulldata).then(function (values) {
        console.log('GET DETAILS RETURNED VALUE', values)
        dataarray.push(values);
      })
    }
    // console.log('xxxxx',dataarray)
    return dataarray;
  }

  // ARRANGE DATA RECEIVED
  async function getDetails(data) {
    console.log('INSIDE GET DETAILS FUNCTIONS', data)
    let prescriptiondata = {};
    for (const item of data) {
      await Promise.all([getspecificdetails(item)]).then(function (values) {
        if (values[0].type == 'doctor') {
          prescriptiondata.doctor = values[0].data
        }
        else if (values[0].type == 'advice') {
          prescriptiondata.advice = values[0].data
        }
        else if (values[0].type == 'medicine') {
          prescriptiondata.medicine = values[0].data
        }
        else if (values[0].type == 'diagnosis') {
          prescriptiondata.diagnosis = values[0].data
        }
        else if (values[0].type == 'instruction') {
          prescriptiondata.instruction = values[0].data
        }
        else if (values[0].type == 'recommended') {
          prescriptiondata.recommended = values[0].data
        }
        else if (values[0].type == 'lifestyle') {
          prescriptiondata.lifestyle = values[0].data
        }
        else if (values[0].type == 'prescription') {
          prescriptiondata.prescriptionId = values[0].data
        }
      })
    }
    return prescriptiondata


  }

  // FIND DETAIL OF DOCTOR ,PRESCRIPTIONS INDIVIDUALLY
  async function getspecificdetails(item) {
    // console.log('INSIDE GETSPECIFIC DETAIL FUNCTION ', item);
    const doctor = app.models.doctor;
    const medicine = app.models.prescribeMedicine;
    const advice = app.models.advice;
    const lifestyle = app.models.lifeStyle;
    const instruction = app.models.instruction;
    const diagnosis = app.models.diagnosis;
    const recommended = app.models.recommended;
    return new Promise((resolve) => {
      if (item.doctorId) {
        doctor.findOne({ where: { doctorId: item.doctorId.split('#')[1] } }, function (err, doctordetails) {
          // console.log('doctor details', doctordetails)
          let data1 = {
            type: 'doctor',
            data: doctordetails
          }
          resolve(data1)
        })
      }
      else if (item.medicineId) {
        medicine.findOne({ where: { prescribeMedicineId: item.medicineId.split('#')[1] } }, function (err, meddetails) {
          // console.log('medicine details', meddetails)
          let data2 = {
            type: 'medicine',
            data: meddetails
          }
          resolve(data2);
        })
      }
      else if (item.adviceId) {
        advice.findOne({ where: { adviceId: item.adviceId.split('#')[1] } }, function (err, advdetails) {
          // console.log('advic details', advdetails);

          let data3 = {
            type: 'advice',
            data: advdetails
          }
          resolve(data3);
        })
      }
      else if (item.diagnosisId) {
        diagnosis.findOne({ where: { diagnosisId: item.diagnosisId.split('#')[1] } }, function (err, diagnosisdetails) {
          // console.log('diagnosisdetails details', diagnosisdetails);
          let data4 = {
            type: 'diagnosis',
            data: diagnosisdetails
          }
          resolve(data4);
        })
      }
      else if (item.lifeStyleId) {
        lifestyle.findOne({ where: { lifeStyleId: item.lifeStyleId.split('#')[1] } }, function (err, lifedetails) {
          // console.log('liefdetails details', lifedetails);
          let data5 = {
            type: 'lifestyle',
            data: lifedetails
          }
          resolve(data5);
        })
      }
      else if (item.specificInstructionId) {
        instruction.findOne({ where: { specificInstructionId: item.specificInstructionId.split('#')[1] } }, function (err, instructiondetails) {
          // console.log('instructiondetails details', instructiondetails);

          let data6 = {
            type: 'instruction',
            data: instructiondetails
          }
          resolve(data6);
        })
      }
      else if (item.recommendedId) {
        recommended.findOne({ where: { recommendedId: item.recommendedId.split('#')[1] } }, function (err, recommendeddetails) {
          // console.log('recommendeddetails details', recommendeddetails);
          let data7 = {
            type: 'recommended',
            data: recommendeddetails
          }
          resolve(data7);
        })
      }
      else if (item.prescriptionId) {
        let data8 = {
          type: 'prescription',
          data: item.prescriptionId
        }
        resolve(data8)
      }
    })
  }
  /**************************************************** ENDS ****************************************************** */
};
