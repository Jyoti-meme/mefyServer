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
    returns: { arg: 'result', type: 'string', root: true },
  });

  prescription.createpres = function (data, cb) {
    // console.log('data,', data);
    var dataArray = [];
    prescription.create({ doctorId: data.doctorId, individualId: data.individualId }, function (err, pres) {
      console.log('ERR', err)
      console.log('PRES', pres)
      if (!err) {

        //form an array of data then send to generate ids
        if (data.medicine && data.medicine.length != 0) {
          // console.log('inside data medicine')
          let data1 = {
            type: "medicine",
            medd: data.medicine
          }
          dataArray.push(data1);
        }
        if (data.diagnosis && data.diagnosis.length != 0) {
          // console.log('inside data diagnosis')
          let data2 = {
            type: "diagnosis",
            diag: data.diagnosis
          }
          dataArray.push(data2)
        }
        if (data.advice && data.advice.length != 0) {
          // console.log('inside data advice')
          let data3 = {
            type: "advice",
            adv: data.advice
          }
          dataArray.push(data3);
        }
        if (data.lifestyle && data.lifestyle.length != 0) {
          // console.log('inside data lifestyle')
          let data4 = {
            type: "lifestyle",
            life: data.lifestyle
          }
          dataArray.push(data4);
        }
        if (data.instruction && data.instruction.length != 0) {
          // console.log('inside data instruction')
          let data5 = {
            type: "instructions",
            ins: data.instruction
          }
          dataArray.push(data5);
        }
        if (data.recommended && data.recommended.length != 0) {
          // console.log('inside data recommended')
          let data6 = {
            type: "recommended",
            recomm: data.recommended
          }
          dataArray.push(data6);
        }
        console.log('DATA ARRAY', dataArray)
        // GENERATE IDS THEN UPDATE PRESCRIPTION
        generateIds(dataArray).then(function (values) {

          console.log('GenerateIds returned value', values)
          // console.log(values.medicineId.length != 0 ? values.medicineId : [])
          pres.updateAttributes({
            medicineId: values.medicineId ? (values.medicineId.length != 0 ? values.medicineId : []) : [], adviceId: values.adviceId ? (values.adviceId.length != 0 ? values.adviceId : []) : [],
            lifeStyleId: values.lifestyleId ? (values.lifestyleId.length != 0 ? values.lifestyleId : []) : [], diagnosisId: values.diagnosisId ? (values.diagnosisId.length != 0 ? values.diagnosisId : []) : [],
            specificInstructionId: values.instructionId ? (values.instructionId.length != 0 ? values.instructionId : []) : [], recommendedId: values.recommendedId ? (values.recommendedId.length != 0 ? values.recommendedId : []) : []

          }, function (err, created) {
            // console.log('PRESCRIPTION UPDATE ERROR', err);
            // console.log('PRESCRIPTION UPDATED SUCCESS', created);
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
      // console.log('INSIDE FOR LOOP', instance)
      await Promise.all([aggregate(instance)]).then(function (values) {
        // console.log('AGGRGATE FUNCTION VALUE', values);
        // console.log(values[0])
        if (values[0].hasOwnProperty("medicineId")) {
          // console.log('insode if')
          x.medicineId = values[0].medicineId;
          // console.log(x)
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
    // console.log('INSIDE AGGREGATE FUNCTION', instance);
    const medicine = app.models.prescribeMedicine;
    const advice = app.models.advice;
    const lifestyle = app.models.lifeStyle;
    const instruction = app.models.instruction;
    const diagnosis = app.models.diagnosis;
    const recommended = app.models.recommended;
    return new Promise((resolve) => {
      if (instance.type == "medicine") {
        let medarray = [];
        medicine.create([instance.medd], function (err, med) {
          // console.log('err', err);
          // console.log('MED', med)
          med[0].forEach(element => {
            medarray.push(element.prescribeMedicineId)
          })
          // console.log('medarray',medarray)
          let datasent = {
            medicineId: medarray,

          }
          resolve(datasent)
        })
      }
      else if (instance.type == "diagnosis") {
        let diagarray = [];
        diagnosis.create([instance.diag], function (err, diag) {
          // console.log('err', err);
          // console.log('DIAG', diag[0][0])
          diag[0].forEach(element => {
            diagarray.push(element.diagnosisId)
          })
          let datasent = {
            diagnosisId: diagarray,

          }
          resolve(datasent)
        })
      }
      else if (instance.type == "advice") {
        let advarray = [];
        advice.create([instance.adv], function (err, adv) {
          // console.log('err', err);
          // console.log('ADV', adv);
          adv[0].forEach(element => {
            advarray.push(element.adviceId)
          })
          let datasent = {
            adviceId: advarray,

          }
          resolve(datasent)
        })
      }
      else if (instance.type == "recommended") {
        let recomarray = [];
        recommended.create([instance.recomm], function (err, rec) {
          // console.log('err', err);
          // console.log('REC', rec);
          rec[0].forEach(element => {
            recomarray.push(element.recommendedId)
          })
          let datasent = {
            recommendedId: recomarray,

          }
          resolve(datasent)
        })
      }
      else if (instance.type == "lifestyle") {
        let lifearray = [];
        lifestyle.create([instance.life], function (err, life) {
          // console.log('err', err);
          // console.log('LIFE', life);
          life[0].forEach(element => {
            lifearray.push(element.lifeStyleId)
          })
          let datasent = {
            lifestyleId: lifearray,

          }
          resolve(datasent)
        })
      }
      else if (instance.type == "instructions") {
        let insarray = [];
        instruction.create([instance.ins], function (err, ins) {
          console.log('err', err);
          console.log('Ins', ins);
          ins[0].forEach(element => {
            insarray.push(element.instructionId)
          })
          let datasent = {
            instructionId: insarray,

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
    returns: { arg: 'result', type: 'any', root: true },
  });

  // LOGIC FOR GETTING DETAILS
  prescription.prescriptionbyindividualId = function (individualId, cb) {
    prescription.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individualId } }, function (err, list) {
      console.log('list',list);
      console.log(err)
      // cb(null,list)
      if(!err && list.length!=0){
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
      }
      else{
        let data={
          error:false,
          result:[],
          message:'No prescription found'
        }
        cb(null,data)
      }
    })
  }

  // FORM  DATA IN A WAY TO FETCH DETAILS 
  async function fetchDetail(preslist) {
    // console.log('INSIDE FETCHDETAIL FUNCTION', preslist)
    let dataarray = [];
    for (const instance of preslist) {
      // console.log('instance', instance)
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
      if (instance.individualId) {
        let data9 = {
          individualId: instance.individualId
        }
        fulldata.push(data9)
      }
      console.log('FULLDATA',fulldata)
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
    // console.log('INSIDE GET DETAILS FUNCTIONS', data)
    let prescriptiondata = {};
    for (const item of data) {
      // console.log('ITEMSSS', item)

      await Promise.all([getspecificdetails(item)]).then(function (values) {
        // console.log(' SPECIFIC DETAIL RETURNED VALUES', values);

        if (values[0].type == 'advice') {
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
        else if (values[0].type == 'doctor') {
          prescriptiondata.doctor = values[0].data
        }
        else if (values[0].type == 'individual') {
          prescriptiondata.individualId = values[0].data
        }

      })
    }
    return prescriptiondata


  }



  // FIND DETAIL OF DOCTOR ,PRESCRIPTIONS INDIVIDUALLY
  async function getspecificdetails(item) {
    // console.log('INSIDE GETSPECIFIC DETAIL FUNCTION ', item);
    const doctor = app.models.doctor;
    const individual = app.models.individual;
    const pmedicine = app.models.prescribeMedicine;
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
      // check medicineid array and fetch data ,,if array is blank resolve blank array
      else if (item.medicineId) {
        let medarray = [];
        if (item.medicineId.length != 0) {
          item.medicineId.forEach(element => {
            // console.log('element', element)
            pmedicine.findOne({ where: { prescribeMedicineId: element.split('#')[1] } }, function (err, meddetails) {
              // console.log('meddetais', meddetails, 'err::', err);
              medarray.push(meddetails);
              // console.log('medarray',medarray)
              let data2 = {
                type: 'medicine',
                data: medarray
              }
              if (item.medicineId.indexOf(element) == item.medicineId.length - 1) {
                resolve(data2)
              }

            })
          })
        }
        else {
          let data2 = {
            type: 'medicine',
            data: []
          }
          resolve(data2)
        }

      }
      else if (item.adviceId) {
        let advarray = [];
        if (item.adviceId.length != 0) {
          item.adviceId.forEach(element => {
            // console.log('element', element)
            advice.findOne({ where: { adviceId: element.split('#')[1] } }, function (err, advdetails) {
              console.log('advdetails', advdetails, 'err::', err);
              advarray.push(advdetails);
              // console.log('medarray',medarray)
              let data3 = {
                type: 'advice',
                data: advarray
              }
              if (item.adviceId.indexOf(element) == item.adviceId.length - 1) {
                resolve(data3)
              }

            })
          })
        }
        else {
          let data3 = {
            type: 'advice',
            data: []
          }
          resolve(data3)
        }

      }
      else if (item.diagnosisId) {
        let diagnosisarray = [];
        if (item.diagnosisId.length != 0) {
          item.diagnosisId.forEach(element => {
            console.log('element', element)
            diagnosis.findOne({ where: { diagnosisId: element.split('#')[1] } }, function (err, diagnosisdetails) {
              console.log('diagnosisdetails', diagnosisdetails, 'err::', err);
              diagnosisarray.push(diagnosisdetails);
              // console.log('medarray',medarray)
              let data4 = {
                type: 'diagnosis',
                data: diagnosisarray
              }
              if (item.diagnosisId.indexOf(element) == item.diagnosisId.length - 1) {
                resolve(data4)
              }

            })
          })
        }
        else {
          let data4 = {
            type: 'diagnosis',
            data: []
          }
          resolve(data4)
        }

      }
      else if (item.lifeStyleId) {
        let lifearray = [];
        if (item.lifeStyleId.length != 0) {
          item.lifeStyleId.forEach(element => {
            // console.log('element', element)
            lifestyle.findOne({ where: { lifeStyleId: element.split('#')[1] } }, function (err, lifedetails) {
              // console.log('lifedetails', lifedetails, 'err::', err);
              lifearray.push(lifedetails);
              // console.log('medarray',medarray)
              let data5 = {
                type: 'lifestyle',
                data: lifearray
              }
              if (item.lifeStyleId.indexOf(element) == item.lifeStyleId.length - 1) {
                resolve(data5)
              }

            })
          })
        }
        else {
          let data5 = {
            type: 'lifestyle',
            data: []
          }
          resolve(data5)
        }

      }
      else if (item.specificInstructionId) {
        let instructionarray = [];
        if (item.specificInstructionId.length != 0) {
          item.specificInstructionId.forEach(element => {
            // console.log('element', element)
            instruction.findOne({ where: { instructionId: element.split('#')[1] } }, function (err, instructiondetails) {
              // console.log('instructiondetails', instructiondetails, 'err::', err);
              instructionarray.push(instructiondetails);
              // console.log('medarray',medarray)
              let data6 = {
                type: 'instruction',
                data: instructionarray
              }
              if (item.specificInstructionId.indexOf(element) == item.specificInstructionId.length - 1) {
                resolve(data6);
              }

            })
          })
        }
        else {
          let data6 = {
            type: 'instruction',
            data: []
          }
          resolve(data6)
        }

      }
      else if (item.recommendedId) {
        let recommarray = [];
        if (item.recommendedId.length != 0) {
          item.recommendedId.forEach(element => {
            // console.log('element', element)
            recommended.findOne({ where: { recommendedId: item.recommendedId[0].split('#')[1] } }, function (err, recommendeddetails) {
              recommarray.push(recommendeddetails);
              // console.log('medarray',medarray)
              let data7 = {
                type: 'recommended',
                data: recommarray
              }
              if (item.recommendedId.indexOf(element) == item.recommendedId.length - 1) {
                resolve(data7);
              }

            })
          })
        }
        else {
          let data7 = {
            type: 'recommended',
            data: []
          }
          resolve(data7)
        }
      }

      else if (item.prescriptionId) {
        let data8 = {
          type: 'prescription',
          data: item.prescriptionId
        }
        resolve(data8)
      }
      else if (item.individualId) {
        // console.log('inssdidid')
        individual.findOne({ where: { individualId: item.individualId.split('#')[1] } }, function (err, indvdetails) {
          // console.log('indvdetails details', indvdetails)
          console.log('err', err)
          let data9 = {
            type: 'individual',
            data: indvdetails
          }
          resolve(data9)
        })
      }

    })
  }

  /**************************************************** ENDS ****************************************************** */

  /************************************ GET PRESCRIPTION DETAILS BY PRESCRIPTION ID ****************************** */
  prescription.remoteMethod('prescriptionbyprescriptionId', {
    http: { path: '/prescriptiondetail', verb: 'get' },
    description: "get prescription by prescriptionId",
    accepts: { arg: 'prescriptionId', type: 'string' },
    returns: { arg: 'result', type: 'any' },
  });

  //LOGIC FOR GETTING PRESCRIPTION DETAILS BY PRESCRIPTIONID
  prescription.prescriptionbyprescriptionId = function (prescriptionId, cb) {
    let x = [];
    prescription.findOne({ where: { prescriptionId: prescriptionId } }, function (err, pres) {
      console.log('prescriptionid', pres);
      x.push(pres)
      fetchDetail(x).then(function (result) {
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

  /********************************************************* ENDS ********************************************* */




  // prescription.observe('loaded', function (context, next) {
  //   // console.log('CONTEXT DATA', context.data);

  //   const Individual = app.models.individual;
  //   const Doctor = app.models.doctor;
  //   // FETCH INDIVIDUAL DETAILS
  //   Promise.all([getIndividualDetails(context.data.individualId), getDoctorDetails(context.data.doctorId)]).then(function (values) {
  //     // console.log('values', values)
  //     if (values[0] == 'nothing') {
  //       context.data.individuals = null;
  //       delete context.data['individualId'];
  //     }
  //     else {
  //       context.data.individuals = values[0];
  //       delete context.data['individualId'];
  //     }
  //     if (values[1] == 'nothing') {
  //       context.data.doctors = null;
  //       delete context.data['doctorId'];
  //     }
  //     else {
  //       context.data.doctors = values[1];
  //       delete context.data['doctorId'];
  //     }

  //     next();
  //   }).catch(err => {
  //     // console.log('CATCHED ERROR')
  //     // console.log('catched error', err)
  //     next();
  //   })
  // })



  // GET INDIVIDUAL DETAILS
  // async function getIndividualDetails(indvId) {
  //   const Individual = app.models.individual;
  //   return new Promise((resolve, reject) => {
  //     Individual.findOne({ where: { individualId: indvId.includes('#') ? indvId.split('#')[1] : indvId } }, function (indverr, indv) {
  //       // console.log(indverr + ':::::' + indv);
  //       if (!indverr) {
  //         if (indv != null && Object.keys(indv).length != 0) {
  //           resolve(indv)
  //         }
  //         else {
  //           resolve('nothing')
  //         }
  //       }
  //       // if(!indverr && indv!=null&& Object.keys(indv).length!=0){
  //       //   resolve(indv);
  //       // }
  //       // else{
  //       //   reject('Individual detail not found');
  //       // }
  //     })
  //   })
  // }

  // GET DOCTOR DETAILS
  // async function getDoctorDetails(doctorId) {
  //   const Doctor = app.models.doctor;
  //   return new Promise((resolve, reject) => {
  //     Doctor.findOne({ where: { doctorId: doctorId.includes('#') ? doctorId.split('#')[1] : doctorId } }, function (docerr, doctor) {
  //       // console.log(docerr + ':::::' + doctor);

  //       if (!docerr) {
  //         if (doctor != null && Object.keys(doctor).length != 0) {
  //           resolve(doctor)
  //         }
  //         else {
  //           resolve('nothing')
  //         }
  //       }
  //       //   if(!docerr && doctor!=null && Object.keys(doctor).length!=0){
  //       //     resolve(doctor);
  //       //   }
  //       //  else{
  //       //   reject('Doctor detail not found')
  //       //  }
  //     })
  //   })
  // }
}