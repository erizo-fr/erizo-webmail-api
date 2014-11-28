'use strict';
var MODULE_NAME = 'AccountSanitizer';

var logger = require('log4js').getLogger(MODULE_NAME);
var sanitizerHelper = require('./sanitizerHelper');


module.exports.getUserData = function * (next) {
	yield next;
};

module.exports.updateUserData = function * (next) {
    this.checkBody('data').notEmpty();
	if (this.errors) {
		this.status = 400;
		this.body = this.errors;
		return;
	}
    
	yield next;
};