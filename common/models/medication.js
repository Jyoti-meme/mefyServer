'use strict';

const Composer = require('../lib/composer.js');
const moment = require('moment');
const app = require('../../server/server');
const medicineList = require('../../medicine.json');

module.exports = function (medication) {
  const enabledRemoteMethods = ["findById", "deleteById", "find", "Medication", "getMedicineList", "getMedicineNameList"];
  medication.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      medication.disableRemoteMethodByName(methodName);
    }
  });

  /************************CREATE MEDICINE******************************/
  medication.remoteMethod('Medication', {
    http: { path: '/create', verb: 'post' },
    description: ' use to create medicine',
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' },
  })
  medication.Medication = function (data, cb) {
    console.log('data', data)
    var comingDate = moment(data.medicationDate).format('YYYY-MM-DD');
    console.log('comingDate', comingDate)
    medication.create({
      individualId: data.individualId, medicineName: data.medicineName, dosage: data.dosage, days: data.days, medicationDate: comingDate, healthRecordType: "Medicine Details", frequency: data.frequency, adverseEffects: data.adverseEffects, currentStatus: data.currentStatus
    }, function (err, res) {
      if (err) {
        let errmsg = {
          error: true,
          message: 'Something Went Wrong',
        }
        cb(null, errmsg)
      }
      else {
        let sucessMsg = {
          error: false,
          result: res,
          message: 'Sucessfully Medicine Created'
        }
        cb(null, sucessMsg)
      }
    })
  }
  /************************ END OF CREATE MEDICINE API ******************************/
  /************************GET  MEDICINE LIST BY INDIVIDUAL ID******************************/
  medication.remoteMethod('getMedicineList', {
    http: { path: '/getMedicineByIndividaualId', verb: 'get' },
    description: 'get medicine list by individual id',
    accepts: { arg: 'individualId', type: 'string', required: true },
    returns: { arg: 'result', type: 'any' }
  })
  medication.getMedicineList = function (individualId, cb) {
    medication.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individualId } }, function (err, exists) {
      console.log('data', 'resource:io.mefy.individual.individual#' + individualId)
      if (err) {
        let errmsg = {
          error: true,
          message: 'Something Went wrong'
        }
        cb(null, errmsg)
      }
      else {
        if (exists != null && Object.keys(exists).length != 0) {
          let sucessMsg = {
            error: false,
            result: exists,
            message: 'Getting List Of Medicine'
          }
          cb(null, sucessMsg)
        }
        else {
          cb(null, 'Not found')
        }
      }
    })
  }
  /************************END ******************************/

  /***********************GET MECINIE NAME LIST FORM JSON FILE**************************/
  medication.remoteMethod('getMedicineNameList', {
    http: { path: '/medicineList', verb: 'get' },
    description: 'get medicine name list',
    returns: { arg: 'result', type: 'any' }
  })
  medication.getMedicineNameList = function (cb) {
    let medicineName = {
      error: false,
      result: medicineList,
      message: 'Get  List Of Medicine Name',
    }
    cb(null, medicineName)
  }
  /************************END ******************************/

}