'use strict';

const Composer = require('../lib/composer.js');

module.exports = function (bill) {
  const enabledRemoteMethods = ["findById", "deleteById", "find", "createBill"];
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
};
