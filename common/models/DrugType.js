'use strict';
// const Composer = require('../lib/composer.js');
// const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
// const bizNetworkConnection = new BusinessNetworkConnection();
// const cardName = "admin@mefy";

module.exports = function (Drugtype) {

    /** alter type and trim to get typeId */
    Drugtype.beforeRemote('create', function (context, drugtype, next) {
        let drugtypeId;
        if (context.args.data.type.includes('')) {
            drugtypeId = context.args.data.type.replace(/ +/g, "");
        }
        else {
            drugtypeId = context.args.data.type;
        }
        context.args.data.typeId = drugtypeId.toLowerCase();
        next();
    });

};
