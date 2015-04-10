'use strict';
var MODULE_NAME = 'ContactController';

var logger = require('log4js').getLogger(MODULE_NAME);

var contactService = require('../services/contactService');
var davManager = require('../managers/davManager');


module.exports.searchContacts = function * () {	
	let criteria = this.query.criteria;
	let limit = this.query.limit;
	let result = yield contactService.searchContacts(this.session.username, this.session.password, criteria, limit);
	this.body = result;
	this.status = 200;
};