var https = require('https'),
    httpProxy = require('http-proxy'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    config = require('./config.js'),
    token;

function dateprint() {
    var now = new Date()
    //var args = Array.prototype.slice.call(arguments)
    var args = Array.from(arguments)
    console.log(now,args.join(' '))
}

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
            dateprint(err, err.stack)
            setTimeout(setToken,3600000)
        } else {
            dateprint("Token successfully acquired")
            token = data
            setTimeout(setToken,14400000)
        }
    });
}

function setOutLocation(loc){
    var re = new RegExp(config.localHost,"g")
    loc.replace(re,config.remoteHost)
    return loc
}
function setInLocation(loc){
    var re = new RegExp(config.remoteHost,"g")
    loc.replace(re,config.localHost)
    return loc
}

//
//  Start by grabbing the token from AWS API
//
setToken()

//
// Create a proxy server with custom application logic
//
dateprint("Starting proxy for", config.remoteHost)
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
    dateprint(req.connection.remoteAddress,req.method,req.url);
});

proxy.on('proxyRes', function(proxyRes,req,res){
    var loc = String(proxyRes.headers.location)
    var re = new RegExp(config.remoteHost,"g")
    var fixedloc = loc.replace(re,config.localHost + ':' + config.localPort)
});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
//const opts = {
    //ssl: {
        //key: fs.readFileSync('server.key','utf-8'),
        //cert: fs.readFileSync('server.cert','utf-8')
    //}
//};

//var server = https.createServer(opts, function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
    //proxy.web(req, res, { target: parse('https://%s:443', config.remoteHost) });
//});

//console.log("listening on port config.localPort")
//server.listen(config.localPort,'127.0.0.1');
