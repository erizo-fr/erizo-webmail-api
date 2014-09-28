'use strict';
var MODULE_NAME = 'imapHelper';

var logger = require('log4js').getLogger(MODULE_NAME);
var Q = require('q');


module.exports.getSentBox = function * (connection) {
	return yield module.exports.getSpecialBox(connection, '\\Sent');
};

module.exports.getSpecialBox = function * (connection, specialAttribute) {
	logger.debug('Getting special box: ' + specialAttribute);
	let boxes = yield Q.ninvoke(connection, 'getBoxes');
	let specialBoxList = findBoxBySpecialAttribute(boxes, specialAttribute);
	
	let specialBox = specialBoxList[0];
	if(! specialBox) {
		logger.debug('No special box found');
	} else {
		logger.debug('Box ' + specialAttribute + ' found : ' + specialBox.path);
	}
	return specialBox;
};

function findBoxBySpecialAttribute(boxes, attribute, path) {
	let matchingBoxes = [];
	for (let boxName in boxes) {
		if (boxes.hasOwnProperty(boxName)) {
			let box = boxes[boxName];

			//Add path into box
			box.path = path ? path + boxName : boxName;

			//Add box if it match
			let specialAttributes = box.special_use_attrib;
			if (specialAttributes && specialAttributes.indexOf(attribute) !== -1) {
				matchingBoxes.push(box);
			}
			
			//Add children
			if(box.children) {
				let newPath = box.path + (box.delimiter || '+');
				let res = findBoxBySpecialAttribute(box.children, attribute, newPath);
				matchingBoxes.concat(res);
			}
		}
	}
	return matchingBoxes;
}