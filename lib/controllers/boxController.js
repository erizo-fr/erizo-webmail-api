'use strict';
var MODULE_NAME = 'BoxController';

var logger = require('log4js').getLogger(MODULE_NAME);
var imapManager = require('../imapManager');
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
	this.checkParams('box').notEmpty();
	
	if (this.errors) {
		this.status = 400;
        this.body = this.errors;
        return;
    }
	
	logger.debug('Getting the IMAP connection');
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password);
	
	logger.debug('Testing folder existance');
	let boxExists = yield boxService.boxExists(imapConnection, this.params.box);
	if(!boxExists) {
		this.status = 404;
        this.body = 'The folder does not exist';
        return;
	}
	
	logger.debug('Getting folder details');
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
