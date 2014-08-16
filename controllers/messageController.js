'use strict';
var MODULE_NAME = 'MessageController';

var logger = require('log4js').getLogger(MODULE_NAME);
var imapManager = require('../lib/imapManager');
var messageService = require('../services/messageService');

var PATTERN_IDS = new RegExp('^(\\d+(:\\d+)?)(,(\\d+(:\\d+)?))*$');
var ALLOWED_BODIES = ['HEADER', 'TEXT', '']; //TODO: Change it to a regex
var DEFAULT_BODIES = '';


module.exports.getMessages = function *() {
	this.checkParams('box').notEmpty();
	this.checkQuery('ids').notEmpty().replace(' ', '').match(PATTERN_IDS);
	this.checkQuery('bodies').optional().default(DEFAULT_BODIES).isIn(ALLOWED_BODIES);
	this.checkQuery('markSeen').optional().default('false').toBoolean();
	this.checkQuery('fetchStruct').optional().default('false').toBoolean();
	this.checkQuery('fetchEnvelope').optional().default('false').toBoolean();
	this.checkQuery('fetchSize').optional().default('false').toBoolean();
	
	if (this.errors) {
		this.status = 400;
        this.body = this.errors;
        return;
    }

	var options = {
		bodies : this.query.bodies,
		markSeen : this.query.markSeen,
		struct : this.query.fetchStruct,
		envelope : this.query.fetchEnvelope,
		size : this.query.fetchSize,
	};
	var imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password);
	var result = yield messageService.getMessagesT(imapConnection, this.params.box, this.query.ids, options);

	this.body = JSON.stringify(result, null, '\t');
	this.status = 200;
};
