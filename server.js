/*
 *  This file is part of ecr-proxy-node
 *
 *  ecr-proxy-node is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  ecr-proxy-node is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with ecr-proxy-node.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  Copyright (C) 2017 Will Tomlinson <watomlinson@gmail.com>
 */

var https = require('https');
var httpProxy = require('http-proxy');
var AWS = require('aws-sdk');
var fs = require('fs');
var logger = require('./lib/logger.js');
var config = require('./lib/config.js');
var token;

// Silly string replace function
function parse(str) {
  var args = [].slice.call(arguments, 1),
    i = 0;

    return str.replace(/%s/g, function() {
      return args[i++];
  });
}

// Sets the token needed for ECR access periodically, default every 6 hours,
// retry failed tokens every 1 hour.
function setToken() {
  var params = {};
  var ecr = new AWS.ECR({"region":"us-east-1"});
  ecr.getAuthorizationToken(params, function(err,data){
    if (err) {
      logger.error(err.code + " - " + err.message)
      setTimeout(setToken,3600000)
    } else {
      logger.info("Token successfully acquired")
      token = data
      setTimeout(setToken,14400000)
    }
  });
}

/*
 *  Main program
 */

//  Start by grabbing the token from AWS API
setToken()

// Create a proxy server with custom application logic
var options = {};
if (config.useSsl == 'true'){
  options = {
    ssl: {
      key: fs.readFileSync(config.serverKey,'utf-8'),
      cert: fs.readFileSync(config.serverCert,'utf-8')
    },
    target: 'https://' + config.remoteHost + ":" + config.remotePort,
    secure:false,
  }
} else {
  options = {
    target: 'https://' + config.remoteHost + ":" + config.remotePort,
    secure:false,
  }
}

logger.info("Starting proxy for", config.remoteHost + ":" + config.remotePort, "on", config.localHost + ":" + config.localPort)
var proxy = httpProxy.createProxyServer(options).listen(config.localPort);

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('Host', config.remoteHost);
  proxyReq.setHeader('Authorization', "Basic " + token.authorizationData[0].authorizationToken);
  logger.info(req.connection.remoteAddress,req.method,req.url);
});

proxy.on('proxyRes', function(proxyRes,req,res){
  var loc = String(proxyRes.headers.location)
  var re = new RegExp(config.remoteHost,"g")
  var fixedloc = loc.replace(re,config.localHost + ':' + config.localPort)
  proxyRes.headers.location = fixedloc
});
