'use strict';
var MODULE_NAME = 'BoxSanitizer';

var logger = require('log4js').getLogger(MODULE_NAME);
var sanitizerHelper = require('./sanitizerHelper');


module.exports.getBoxes = function * (next) {
	yield next;
};


module.exports.getBox = function * (next) {
	this.checkParams('box').notEmpty().match(sanitizerHelper.PATTERN_BOX);
	
    if (!sanitizerHelper.hasError.call(this)) {
        yield next;
    }
};

module.exports.createBox = function * (next) {
	this.checkBody('path').notEmpty().trim().match(sanitizerHelper.PATTERN_BOX);
	
    if (!sanitizerHelper.hasError.call(this)) {
        yield next;
    }
};

module.exports.deleteBox = function * (next) {
	this.checkParams('box').notEmpty().match(sanitizerHelper.PATTERN_BOX);
	
    if (!sanitizerHelper.hasError.call(this)) {
        yield next;
    }
};

module.exports.patchBox = function * (next) {
	this.checkParams('box').notEmpty().match(sanitizerHelper.PATTERN_BOX);
	this.checkBody('path').notEmpty().trim().match(sanitizerHelper.PATTERN_BOX);
	
    if (!sanitizerHelper.hasError.call(this)) {
        yield next;
    }
};