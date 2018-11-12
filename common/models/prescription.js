'use strict';

const Composer = require('../lib/composer.js');
const app = require('../../server/server');

module.exports = function (prescription) {
  Composer.restrictModelMethods(prescription);

  // HIDE UNUSED REMOTE METHODS
  const enabledRemoteMethods = ["findById", "deleteById", "find", "create"];
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

};
