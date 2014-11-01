'use strict';

var MODULE_NAME = 'BoxService';
var logger = require('log4js').getLogger(MODULE_NAME);
var Imap = require('imap');
var Q = require ('q');

module.exports.getBoxes = function * (connection) {
	logger.debug('Getting boxes');
	let boxes = yield Q.ninvoke(connection, 'getBoxes');
    addPaths(boxes);
    return boxes;
};

function addPaths(boxes, parentPath) {
    for (var boxName in boxes) {
        if (boxes.hasOwnProperty(boxName)) {
            let box = boxes[boxName];
            
            let boxPath = boxName;
            if(parentPath !== undefined) {
                boxPath = parentPath + boxPath;
            }
            box.path = boxPath;
            
            if (box.children) {
                addPaths(box.children, boxPath + box.delimiter);
            }
        }
    }
}

module.exports.getBox = function *(connection, boxName) {
	logger.debug('Getting box#' + boxName);
	let box = yield Q.ninvoke(connection, 'openBox', boxName, true);
	logger.debug('The box#' + boxName + ' has been retreived:' + JSON.stringify(box));
	return box;
};

module.exports.boxExists = function *(connection, boxName) {
	let boxes = yield module.exports.getBoxes(connection);
	let boxExists = boxInList(boxName, boxes);
	logger.debug('The box#' + boxName + ' exists = ' + boxExists);
	
	return boxExists;
};

function boxInList(searchedBoxPath, boxes) {
    logger.debug('Test if ' + searchedBoxPath + ' is in ' + boxes);
    for (var boxName in boxes) {
        if (boxes.hasOwnProperty(boxName)) {
            let box = boxes[boxName];
            
            logger.debug('Compare ' + box.path + ' to ' + searchedBoxPath);
            if(box.path === searchedBoxPath) {
                return true;
            }
            
            if (box.children) {
                if (boxInList(searchedBoxPath, box.children)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}