'use strict';
var MODULE_NAME = 'AuthSanitizer';

var logger = require('log4js').getLogger(MODULE_NAME);
var sanitizerHelper = require('./sanitizerHelper');


module.exports.login = function * (next) {
	this.checkBody('username').notEmpty().match(sanitizerHelper.PATTERN_USERNAME);
	this.checkBody('password').notEmpty().match(sanitizerHelper.PATTERN_PASSWORD);									
	if (this.errors) {
		this.status = 400;
		this.body = this.errors;
		return;
	}
	
	yield next;
};

module.exports.logout = function * (next) {
	yield next;
};