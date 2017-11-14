var fs = require('fs')
var confJson = {}
// Check for config files
if (fs.existsSync("./config.json")) {
    confJson = JSON.parse(fs.readFileSync('./config.json','utf8'))
} else if (fs.existsSync("/etc/ecr-proxy-node/config.json")) {
    confJson = JSON.parse(fs.readFileSync('/etc/ecr-proxy-node/config.json','utf8'))
}

var config = {}
config.remoteHost = confJson.remoteHost || process.env.ECR_PROXY_REMOTE_HOST
config.remotePort = confJson.remotePort || process.env.ECR_PROXY_REMOTE_PORT || '443'
config.localHost = confJson.localHost || process.env.ECR_PROXY_LOCAL_HOST || 'localhost' 
config.localPort = confJson.localPort || process.env.ECR_PROXY_LOCAL_PORT || '5000'

// Fail if any required values are missing
if (!config.remoteHost){
    console.log("remoteHost is required")
    process.exit(1)
}

module.exports = config
