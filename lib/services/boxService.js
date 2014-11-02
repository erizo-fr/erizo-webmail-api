'use strict';

var MODULE_NAME = 'BoxService';
var logger = require('log4js').getLogger(MODULE_NAME);
var Imap = require('imap');
var Q = require ('q');

module.exports.getBoxes = function * (connection) {
	logger.debug('Getting boxes');
	let boxes = yield Q.ninvoke(connection, 'getBoxes');
    return boxes;
};

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
            
            //Test if the box is the right one
            logger.debug('Compare ' + boxName + ' to ' + searchedBoxPath);
            if(boxName === searchedBoxPath) {
                return true;
            }
            
            //Test if the searched box may be a children
            if(searchedBoxPath.startsWith(boxName + box.delimiter)) {
                if (box.children) {
                    let newSearchedBoxPath = searchedBoxPath.replace(boxName + box.delimiter, '');
                    if (boxInList(newSearchedBoxPath, box.children)) {
                        return true;
                    }
                }
            }
            
            
        }
    }
    
    return false;
}