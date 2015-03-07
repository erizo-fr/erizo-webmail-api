'use strict';
var MODULE_NAME = 'AccountController';

var logger = require('log4js').getLogger(MODULE_NAME);
var accountService = require('../services/accountService');

module.exports.getUserData = function * () {
	let result = yield accountService.getUserData(this.session.username);
	this.body = result;
	this.status = 200;
};

module.exports.getUserPreferences = function * () {
	let result = yield accountService.getUserPreferences(this.session.username);
	this.body = result;
	this.status = 200;
};

module.exports.updateUserPreferences = function * () {
	yield accountService.updateUserPreferences(this.session.username, this.request.body.data);
	this.status = 200;
};