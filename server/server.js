/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();



app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;


  // start the server if `$ node server.js`
  if (require.main === module) {
    // app.start();   

    /****       SOCKET CONNECTION        **** */
    app.io = require('socket.io')(app.start());
    // require('socketio-auth')(app.io, {
    //   authenticate: function (socket, value, callback) {

    //       var AccessToken = app.models.AccessToken;
    //       //get credentials sent by the client
    //       var token = AccessToken.find({
    //         where:{
    //           and: [{ userId: value.userId }, { id: value.id }]
    //         }
    //       }, function(err, tokenDetail){
    //         if (err) throw err;
    //         if(tokenDetail.length){
    //           callback(null, true);
    //         } else {
    //           callback(null, false);
    //         }
    //       }); //find function..    
    //     } //authenticate function..
    // });
    app.io.on('connection', function (socket) {
      console.log('a user connected');
      socket.on('disconnect', function () {
        console.log('user disconnected', socket.id);

         new Promise(() => {
          app.models.doctor.findOne({ where: { socketId: socket.id } }, function (err, exists) {
            console.log('Doctor Socket Id...', exists)
            if (exists != null && Object.keys(exists).length != 0) {
              exists.updateAttribute({ 'availability': 'Offline' }, function (err, result) {
                console.log('resultttt', result)
                let successmessage = {
                  error: false,
                  result: result,
                  message: 'Now User is offline'
                }
                return successmessage
              })

            } else {
              app.models.individual.findOne({ where: { socketId: socket.id } }, function (err, exists) {
                console.log('Individual Socket Id...', exists)
                exists.updateAttribute({ 'availability': 'Offline' }, function (err, result) {
                  console.log('resultttt', result)
                  let successmessage = {
                    error: false,
                    result: result,
                    message: 'Now User is offline'
                  }
                  return successmessage
                })
              })
            }
          })
        });

      });
    })

    

  }
});






