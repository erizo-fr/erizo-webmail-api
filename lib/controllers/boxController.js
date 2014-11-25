'use strict';
var MODULE_NAME = 'BoxController';

var logger = require('log4js').getLogger(MODULE_NAME);
var imapManager = require('../managers/imapManager');
var imapHelper = require('../imapHelper');
var boxService = require('../services/boxService');


module.exports.getBoxes = function *() {
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password);
	let result = yield boxService.getBoxes(imapConnection);
	logger.debug('Box service result: ' + result);

	this.body = JSON.stringify(result, function (key, value) {
		if(key === 'parent') {
			return undefined;
		} else {
			return value;
		}
	}, '\t');
	this.status = 200;
};


module.exports.getBox = function *() {
	this.checkParams('box').notEmpty().match(imapHelper.PATTERN_BOX);
	if (this.errors) {
		this.status = 400;
        this.body = this.errors;
        return;
    }
	
	//Get the connection
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password);
	
	//Test the box existance
	let boxExists = yield boxService.boxExists(imapConnection, this.params.box);
	if(!boxExists) {
		this.status = 404;
        this.body = 'The box does not exist';
        return;
	}
	
	//Get the box detail
	let result = yield boxService.getBox(imapConnection, this.params.box);

	this.body = JSON.stringify(result, function (key, value) {
		if(key === 'parent') {
			return undefined;
		} else {
			return value;
		}
	}, '\t');
	this.status = 200;
};

module.exports.createBox = function *() {
	this.checkBody('path').notEmpty().trim();
	if (this.errors) {
		this.status = 400;
        this.body = this.errors;
        return;
    }
	
	//Create the box object
	let box = {
		path: this.request.body.path
	};
	
	//Get the connection
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password);
	
	//Test the box existance
	let boxExists = yield boxService.boxExists(imapConnection, box.path);
	if(boxExists) {
		this.status = 400;
        this.body = 'The box already exist';
        return;
	}
	
	//Create the box
	yield boxService.createBox(imapConnection, box);
	this.status = 200;
};

module.exports.deleteBox = function *() {
	this.checkParams('box').notEmpty().match(imapHelper.PATTERN_BOX);
	if (this.errors) {
		this.status = 400;
        this.body = this.errors;
        return;
    }
	
	//Get the connection
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password);
	
	//Test the box existance
	let boxExists = yield boxService.boxExists(imapConnection, this.params.box);
	if(!boxExists) {
		this.status = 404;
        this.body = 'The box does not exist';
        return;
	}
	
	//Create the box
	yield boxService.deleteBox(imapConnection, this.params.box);
	this.status = 200;
};