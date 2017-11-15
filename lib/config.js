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

var fs = require('fs');
var logger = require('./logger.js');
var confJson = {};
// Check for config files
if (fs.existsSync("../config.json")) {
    confJson = JSON.parse(fs.readFileSync('../config.json','utf8'));
} else if (fs.existsSync("/etc/ecr-proxy-node/config.json")) {
    confJson = JSON.parse(fs.readFileSync('/etc/ecr-proxy-node/config.json','utf8'));
}

var config = {};
config.remoteHost = confJson.remoteHost || process.env.ECR_PROXY_REMOTE_HOST;
config.remotePort = confJson.remotePort || process.env.ECR_PROXY_REMOTE_PORT || '443';
config.localHost = confJson.localHost || process.env.ECR_PROXY_LOCAL_HOST || 'localhost';
config.localPort = confJson.localPort || process.env.ECR_PROXY_LOCAL_PORT || '5000';
config.serverKey = confJson.serverKey || process.env.ECR_PROXY_SERVER_KEY;
config.serverKey = confJson.serverCert || process.env.ECR_PROXY_SERVER_CERT;
config.useSsl = confJson.useSsl || process.env.ECR_PROXY_USE_SSL || 'true';

// Fail if any required values are missing
if (!config.remoteHost){
    logger.error("remoteHost is required");
    process.exit(1);
}
if (config.useSsl == 'true') {
    if (!config.serverKey){
        logger.error("serverKey is required when useSsl is set to true");
        process.exit(1);
    }
    if (!config.serverCert){
        logger.error("serverCert is required when useSsl is set to true");
        process.exit(1);
    }
}
module.exports = config;
