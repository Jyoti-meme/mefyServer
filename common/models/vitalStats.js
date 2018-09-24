'use strict';

const Composer = require('../lib/composer.js');

module.exports = function (vitalStats) {
  Composer.restrictModelMethods(vitalStats);

  vitalStats.createRecord = function (data, cb) {
    console.log(data)

    let stringData = "";

    if (typeof data.statsValue == "string") {
      stringData = data.statValue;
    } else {
      console.log(data.statValue);
      stringData = JSON.stringify(data.statValue);
    }

    let vitalRecord = {
      individualId: data.individualId,
      loginTime: data.loginTime,
      statType: data.statType,
      statValue: stringData
    }

    console.log(vitalRecord);
    // {individualId:data.individualId,loginTime:data.loginTime,statType:data.statType,statValue:stringData}
    vitalStats.create(vitalRecord, function (err, res) {
      if (err) {
        let errormessage = {
          error: true,
          message: "Can not save record"
        }
        cb(null, errormessage);
      } else {
        let successMessage = {
          error: true,
          result:res,
          message: "Record has been saved successfully"
        }
        cb(null, successMessage);
      }
    })

    // cb(null, 'Greetings... ' + msg);
  }

  vitalStats.remoteMethod('createRecord', {
    http: { path: '/createRecord', verb: 'post' },
    accepts:
      { arg: 'data', type: 'any', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' }
  });


  /** get last vital stats records record  **/
  vitalStats.getLastRecord = function (individualId, cb) {
    // cb(null, 'Greetings... ' + msg);
    let vistalStats = [];
    let statsTypes = ["bodyScale", "bp", "glucometer", "ecg", "spo2", "temperature", "gsr", "emg", "airflow", "spirometer", "thyroid"];
    processStats(statsTypes)
      .then(function (records) {
        let successMessage = {
          error: true,
          data: records,
          message: "Record has been searched successfully"
        }
        cb(null, successMessage);
      });
  }

  async function processStats(types) {
    const records = [];
    for (const type of types) {
      await Promise.all([getStat(type)]).then(function (values) {
        records = values
      });
    }
    return records;
  }

  async function getStat(statType) {
    // console.log('INSIDE SUBSTITIUE FUNCTION', item)
    return new Promise((resolve) => {
      vitalStats.findOne({ where: { individualId: individualId, statType: type }, order: 'DESC' }, function (err, stats) {
        let record = {
          type: statType,
          value: stats
        }
        resolve(record);
      });
    })
  }

  vitalStats.remoteMethod('getLastRecord', {
    http: { path: '/getLastRecord', verb: 'get' },
    accepts: { arg: 'individualId', type: 'string' },
    returns: { arg: 'result', type: 'any' },
  });


};
