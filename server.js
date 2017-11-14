var https = require('https');
var winston = require('winston');
var httpProxy = require('http-proxy');
var AWS = require('aws-sdk');
var fs = require('fs');
var config = require('./config.js');
var token;

// Create a logger instance
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            timestamp: true
        })
    ]
});

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
            logger.error(err, err.stack)
            setTimeout(setToken,3600000)
        } else {
            logger.info("Token successfully acquired")
            token = data
            setTimeout(setToken,14400000)
        }
    });
}

//
//  Start by grabbing the token from AWS API
//
setToken()

//
// Create a proxy server with custom application logic
//
logger.info("Starting proxy for", config.remoteHost + ":" + config.remotePort, "on", config.localHost + ":" + config.localPort)
var proxy = httpProxy.createProxyServer({
    ssl: {
        key: fs.readFileSync('server.key','utf-8'),
        cert: fs.readFileSync('server.cert','utf-8')
    },
    target: 'https://' + config.remoteHost + ":" + config.remotePort,
    secure:false,
}).listen(config.localPort);


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
