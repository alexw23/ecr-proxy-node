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
