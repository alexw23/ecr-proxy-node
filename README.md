# ecr-proxy-node
A proxy server that handles authentication to AWS ECR so your Docker hosts don't have to.

# Warning
I wrote this in a very short period of time with little knowledge of NodeJS. Please do not just assume it is safe to use in a production environment, publicly exposed to the internet. At the very least you could be exposing your AWS credentials to the world. My intent is to provide a way for internal Docker clients to use an anonymous proxy so as to avoid authentication problems with ECR. I would not personally use it anywhere except in a controlled environment where I trust the clients.

# Usage
TODO

# Contributing
You are more than welcome to help by issuing pull requests and opening issues. I welcome advice from NodeJS programmers far more experienced than I am.
