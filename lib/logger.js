/*
 * This module creates a logger instance
 */
var winston = require('winston')

const logger = new winston.Logger({
      transports: [
                new winston.transports.Console({
                              level: 'debug',
                                          timestamp: true
                                                    })
          ]
});

module.exports = logger
