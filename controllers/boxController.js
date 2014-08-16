'use strict';
var MODULE_NAME = 'BoxController';

var logger = require('log4js').getLogger(MODULE_NAME);
var imapManager = require('../lib/imapManager');
var boxService = require('../services/boxService');

module.exports.getBoxes = function *() {
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password);
	let result = yield boxService.getBoxesT(imapConnection);

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
	
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password);
	let result = yield boxService.getBoxT(imapConnection, this.params.box);

	this.body = JSON.stringify(result, function (key, value) {
		if(key === 'parent') {
			return undefined;
		} else {
			return value;
		}
	}, '\t');
	this.status = 200;
};
