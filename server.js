var https = require('https'),
    httpProxy = require('http-proxy'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    config = require('./config.js'),
    token;


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
            console.log(err, err.stack)
            setTimeout(setToken,3600000)
        } else {
            console.log("Token successfully acquired")
            token = data
            setTimeout(setToken,14400000)
        }
    });
}

function setOutLocation(loc){
    var re = new RegExp(/observer.gizmonicus.org/,"g")
    loc.replace(re,config.repo)
    return loc
}
function setInLocation(loc){
    var re = new RegExp(config.repo,"g")
    loc.replace(re,"observer.gizmonicus.org")
    return loc
}

//
//  Start by grabbing the token from AWS API
//
setToken()

//
// Create a proxy server with custom application logic
//
console.log("Starting proxy for", config.repo)
var proxy = httpProxy.createProxyServer({
    ssl: {
        key: fs.readFileSync('server.key','utf-8'),
        cert: fs.readFileSync('server.cert','utf-8')
    },
    target: parse('https://%s:443', config.repo),
    secure:false,
}).listen(5000);


proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('Host', config.repo);
    proxyReq.setHeader('Authorization', "Basic " + token.authorizationData[0].authorizationToken);
    //console.log(proxyReq.getHeader('Location'));
});

proxy.on('proxyRes', function(proxyRes,req,res){
    var loc = String(proxyRes.headers.location)
    var re = new RegExp(config.repo,"g")
    var fixedloc = loc.replace(re,'observer.gizmonicus.org:5000')
    proxyRes.headers.location = fixedloc
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
    //proxy.web(req, res, { target: parse('https://%s:443', config.repo) });
//});

//console.log("listening on port 5000")
//server.listen(5000,'127.0.0.1');
