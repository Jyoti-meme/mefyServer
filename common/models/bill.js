'use strict';

const Composer = require('../lib/composer.js');

module.exports = function (bill) {
  const enabledRemoteMethods = ["findById", "deleteById", "find", "createBill", "getBillById"];
  bill.sharedClass.methods().forEach(method => {
    const methodName = method.stringName.replace(/.*?(?=\.)/, '').substr(1);
    if (enabledRemoteMethods.indexOf(methodName) === -1) {
      bill.disableRemoteMethodByName(methodName);
    }
  });
  /***********************************BILL CREATION********************************** */
  bill.remoteMethod('createBill', {
    http: { path: '/createBill', verb: 'post' },
    description: "Bill Creation",
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'result', type: 'any' }
  });
  bill.createBill = function (data, cb) {
    if (data != null && Object.keys(data).length != 0) {
      console.log('dataaaaaaaaaaa', data)
      bill.create({ ePrescriptionId: data.ePrescriptionId, doctorId: data.doctorId, individualId: data.individualId, grandTotal: data.grandTotal, status: data.status, bill: data.bill }, function (err, bill) {
        let billmsg = {
          error: false,
          result: bill,
          message: 'Sucessfully Bill Created'
        }
        cb(null, billmsg)
      })
    } else {
      let errmsg = {
        error: true,
        message: 'Not Created'
      }
      cb(null, errmsg)
    }

  }
  /********************************************END************************************************* */
  /******************************************GET BILL BY DOCTORID OR INDIVIDUALID***********************/
  bill.remoteMethod('getBillById', {
    http: { path: '/getBillById', verb: 'get' },
    description: "Get Bill by DoctorId or IndividulaId",
    accepts: [{ arg: 'doctorId', type: 'string' }, { arg: 'individualId', type: 'string' }],
    returns: { arg: 'result', type: 'any' }
  });
  bill.getBillById = function (doctorId, individualId, cb) {
    if (doctorId != null) {
      bill.find({ where: { doctorId: 'resource:io.mefy.doctor.doctor#' + doctorId } }, function (err, exists) {
        console.log(' Doctor exists', exists)

        if (exists != null && Object.keys(exists).length != 0) {
          console.log(' Doctor exists', exists)
          let billList = {
            error: false,
            result: exists,
            message: "Get All Doctor's Bill List"
          }
          cb(null, billList)
        }else {
          let msg = {
            message: 'Not Available'
          }
          cb(null, msg)
        }
      })

    } else {
      bill.find({ where: { individualId: 'resource:io.mefy.individual.individual#' + individualId } }, function (err, exists) {
        if (exists != null && Object.keys(exists).length != 0) {
          console.log(' individual exists', exists)
          let billList = {
            error: false,
            result: exists,
            message: "Get All Individual's Bill List"
          }
          cb(null, billList)
        }else {
          let msg = {
            message: 'Not Available'
          }
          cb(null, msg)
        }
      })
    }
  }
  /****************************************END***************************************** */
};
