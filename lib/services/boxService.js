'use strict';

var MODULE_NAME = 'BoxService';
var logger = require('log4js').getLogger(MODULE_NAME);
var Imap = require('imap');
var Q = require ('q');

module.exports.getBoxes = function * (connection) {
	logger.debug('Getting boxes');
	return yield Q.ninvoke(connection, "getBoxes");
};

module.exports.getBox = function *(connection, boxName) {
	logger.debug('Getting box#' + boxName);
	let box = yield Q.ninvoke(connection, "openBox", boxName, true);
	logger.debug('The box#' + boxName + ' has been retreived:' + box);
	return box;
};

module.exports.boxExists = function *(connection, boxName) {
	let boxes = yield module.exports.getBoxes(connection);
	let boxExists = boxInList(boxName, boxes);
	logger.debug('The box#' + boxName + ' exists = ' + boxExists);
	
	return boxExists;
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