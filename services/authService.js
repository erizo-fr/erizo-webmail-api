'use strict';
var MODULE_NAME = 'AuthService';

var logger = require('log4js').getLogger(MODULE_NAME);
var imapManager = require('../lib/imapManager');

module.exports.login = function (username, password, callback) {
	logger.debug('New auth attempt user#' + username);
	imapManager.getConnection(username, password, function(err, connection) {
		//Close the connection. It's just a login attempt
		if(connection) {
			logger.debug('Closing connection after auth attempt');
			connection.end();
		}

		if(err) {
			if(err.type && err.type === 'no') {
				logger.warn('Server refused the auth attempt of user#' + username);
				callback(null, false);
			} else {				
				logger.debug('Error during auth process: ' + err);
				callback(err, null);
			}
		} else {
			logger.info('Server accepted the auth attempt of user#' + username);
			callback(null, true);
		}
	});
};
module.exports.loginT = function (username, password) {
	return function(callback) {
		module.exports.login(username, password, callback);
	};
};
