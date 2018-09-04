
'use strict';
const qs = require("querystring");
const http = require("http");

var options = {
    "method": "POST",
    "hostname": "control.msg91.com",
    "port": null,
    "path": "http://control.msg91.com/api/retryotp.php?authkey=235289A8Oo7Uojwo5b8cd569&mobile=9593823947",
    "headers": {
      "content-type": "application/x-www-form-urlencoded"
    }
  };

module.exports = function(app) {

app.get('/resendotp', function(req, res) {
  
var req = http.request(options, function (res) {
    var chunks = [];
  console.log('response',res)
    res.on("data", function (chunk) {
        console.log('chunkkk',chunk)
      chunks.push(chunk);
    });
  
    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });
  
  req.write(qs.stringify({}));

  fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(jsonResponse) {
    // do something with jsonResponse
  });
  req.end();
  })
  
}