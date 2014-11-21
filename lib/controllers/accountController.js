'use strict';
var MODULE_NAME = 'AccountController';

var logger = require('log4js').getLogger(MODULE_NAME);
var accountService = require('../services/accountService');

module.exports.getUserData = function * () {
	let result = yield accountService.getUserData(this.session.username);
	this.body = JSON.stringify(result);
	this.status = 200;
};

module.exports.updateUserData = function * () {
    this.checkBody('data').notEmpty();
	if (this.errors) {
		this.status = 400;
		this.body = this.errors;
		return;
	}
    
	yield accountService.updateUserData(this.session.username, this.request.body.data);
	this.body = "OK";
	this.status = 200;
};