# ecr-proxy-node
A proxy server that handles authentication to AWS ECR so your Docker hosts don't have to.

# Warning
I wrote this in a very short period of time with little knowledge of NodeJS. Please do not just assume it is safe to use in a production environment, publicly exposed to the internet. At the very least you could be exposing your AWS credentials to the world. My intent is to provide a way for internal Docker clients to use an anonymous proxy so as to avoid authentication problems with ECR. Do not use it anywhere except in a controlled environment where you trust your Docker clients.

# Usage
At a minimum you need the following:
* AWS credentials - In any form that the SDK can read: environment variables, ~/.aws, instance profile, etc.
* -Either- A config.json with the following elements:
~~~~ javascript
{
  "remoteHost": "your.aws.ecr.repo.domain",
  "remotePort": "443",
  "localHost": "domain.to.use.for.this.proxy",
  "localPort": "5000",
  "useSsl": "true",
  "serverKey": "/path/to/key",
  "serverCert": "/path/to/cert"
}
~~~~
* -Or- set the following environment variables:
~~~~ bash
ECR_PROXY_REMOTE_HOST="your.aws.ecr.repo.domain"
ECR_PROXY_REMOTE_PORT="443"
ECR_PROXY_LOCAL_HOST="domain.to.use.for.this.proxy"
ECR_PROXY_LOCAL_PORT="5000"
ECR_PROXY_USE_SSL="true"
ECR_PROXY_SERVER_KEY="/path/to/key"
ECR_PROXY_SERVER_CERT="/path/to/cert"
~~~~

Note that the only required parameter is remote host and the SSL certificate paths.

Once you have set these configuration options, run the proxy: `node server.js`

The proxy will attempt to obtain a set of temporary credentials from AWS for use with your ECR repo. Every 6 hours it will renew these credentials and tack the appropriate HTTP basic auth header to outbound requests.

# Contributing
You are more than welcome to help by issuing pull requests and opening issues. I welcome advice from NodeJS programmers far more experienced than I am.
