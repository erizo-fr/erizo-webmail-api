'use strict';

var MODULE_NAME = 'BoxService';
var logger = require('log4js').getLogger(MODULE_NAME);
var Imap = require('imap');

module.exports.getBoxes = function (connection, callback) {
	logger.debug('Getting boxes');
	connection.getBoxes(callback);
};
module.exports.getBoxesT = function (connection) {
	return function (callback) {
		module.exports.getBoxes(connection, callback);
	};
};

module.exports.getBox = function (connection, boxName, callback) {
	logger.debug('Getting box#' + boxName);
	connection.openBox(boxName, true, function (err, box) {
		if (err) {
			logger.error('Failed to open box#' + boxName + ':\n' + err);
			callback(err, null);
			return;
		}

		logger.debug('The box#' + boxName + ' has been retreived:\n' + box);
		callback(null, box);
	});
};
module.exports.getBoxT = function (connection, boxName) {
	return function (callback) {
		module.exports.getBox(connection, boxName, callback);
	};
};