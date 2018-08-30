'use strict';

const Composer = require('../lib/composer.js');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const bizNetworkConnection = new BusinessNetworkConnection();
const cardName = "admin@mefy";

module.exports = function (User) {
  // Composer.restrictModelMethods(User);

  User.addPharmacy = async function (userData) {

    bizNetworkConnection.connect(cardName)
      .then((result) => {
        bizNetworkConnection.getAssetRegistry('io.mefy.pharmacy.User')
          .then((result) => {
            console.log(result);
            // this.titlesRegistry = result;
          });
      }).catch((error) => {
        console.log(error);
      });

    let userId = "9734072595";
    let pharmacyUser = {
      "tradeLicenseId": "tradelisenceone",
      "role": "admin"
    }
    return userData;
  }

  User.remoteMethod('addPharmacy', {
    accepts: { arg: 'phoneNumber', type: 'string' },
    returns: { arg: 'phoneNumber', type: 'string' }
  });

};
