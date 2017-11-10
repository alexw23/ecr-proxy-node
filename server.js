var token;
var http = require('http'),
    httpProxy = require('http-proxy'),
    AWS = require('aws-sdk'),
    fs = require('fs');

// Silly string replace function
function parse(str) {
    var args = [].slice.call(arguments, 1),
        i = 0;

    return str.replace(/%s/g, function() {
        return args[i++];
    });
}

function setToken(e, d) {
    if (e) console.log(e, e.stack);
    else token = d;
}

function renewToken() {
    
}



//
// Read configuration file
//
var conf_raw = fs.readFileSync('conf.json');
var conf_json = JSON.parse(conf_raw);

var params = {};
var ecr = new AWS.ECR({"region":"us-east-1"});
ecr.getAuthorizationToken(params, setToken );

setInterval(function(){console.log(token);},2000)

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({
    secure:false,
});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('Host', conf_json.repo);
    console.log(req.method, req.url);
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
server.listen(5000,'127.0.0.1');
