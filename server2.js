var proxy = require('redbird')({port:5000}),
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

setToken()

proxy.register('localhost','https://559139583778.dkr.ecr.us-east-1.amazonaws.com')
