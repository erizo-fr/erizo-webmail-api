'use strict';

var MODULE_NAME = 'BoxService';
var logger = require('log4js').getLogger(MODULE_NAME);
var Imap = require('imap');

module.exports.getBoxes = function(connection, callback) {
	connection.getSubscribedBoxes(callback);
};
module.exports.getBoxesT = function (connection) {
	return function (callback) {
		connection.getBoxes(callback);
	};
};
