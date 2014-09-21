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
			logger.error('Failed to open box#' + boxName + ': ' + err);
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

module.exports.boxExists = function (connection, boxName, callback) {
	module.exports.getBoxes(connection, function (err, boxes) {
		if (err) {
			callback(err, null);
		} else {
			let boxExists = boxInList(boxName, boxes);
			logger.debug('The box#' + boxName + ' exists = ' + boxExists);
			callback(null, boxExists);
		}
	});
};
module.exports.boxExistsT = function (connection, boxName) {
	return function (callback) {
		module.exports.boxExists(connection, boxName, callback);
	};
};

function boxInList(boxName, boxes) {
	if (boxes[boxName]) {
		return true;
	} else {
		for (var box in boxes) {
			if (boxes.hasOwnProperty(box)) {
				if (boxes[box].children) {
					if (boxInList(boxName, boxes[box].children)) {
						return true;
					}
				}
			}
		}
		return false;
	}
}