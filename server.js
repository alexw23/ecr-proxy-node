var http = require('http'),
    httpProxy = require('http-proxy'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
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

//
// Read configuration file
//
var conf_raw = fs.readFileSync('conf.json');
var conf_json = JSON.parse(conf_raw);

/*if ('retry_interval' in conf_json) {
    retryInt = conf_json.retry_interval
}

if ('renew_interval' in conf_json) {
    renewInt = conf_json.renew_interval
}*/


//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({
    secure:false,
});

setToken()

proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('Host', conf_json.repo);
    proxyReq.setHeader('Authorization', "Basic " + token.authorizationData[0].authorizationToken);
    console.log(req.connection.remoteAddress,req.method, req.url);
});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  proxy.web(req, res, { target: parse('https://%s:443', conf_json.repo) });
});

console.log("listening on port 5000")
server.listen(5000,'192.168.11.2');
