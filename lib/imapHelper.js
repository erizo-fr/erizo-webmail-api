'use strict';
var MODULE_NAME = 'imapHelper';

var logger = require('log4js').getLogger(MODULE_NAME);

module.exports.getSendBox = function(connection, callback) {
	connection.getBoxes(function(err, boxes) {
		console.log(boxes);
	});
};