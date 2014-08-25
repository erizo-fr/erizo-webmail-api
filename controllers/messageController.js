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
	this.checkQuery('ids').optional().notEmpty().replace(' ', '').match(PATTERN_IDS);
	this.checkQuery('seqs').optional().notEmpty().replace(' ', '').match(PATTERN_IDS);
	//TODO: Check bodies with regex
	this.checkQuery('bodies').optional();
	this.checkQuery('markSeen').optional().default('false').toBoolean();
	this.checkQuery('fetchStruct').optional().default('false').toBoolean();
	this.checkQuery('fetchEnvelope').optional().default('false').toBoolean();
	this.checkQuery('fetchSize').optional().default('false').toBoolean();
	
	if (this.errors) {
		this.status = 400;
        this.body = this.errors;
        return;
    }
	if('ids' in this.query === 'seqs' in this.query) {
		this.status = 400;
        this.body = 'Only one of ids or seqs param must be given';
		return;
	}

	let options = {
		bodies : this.query.bodies,
		markSeen : this.query.markSeen,
		struct : this.query.fetchStruct,
		envelope : this.query.fetchEnvelope,
		size : this.query.fetchSize,
	};
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password);
	let result;
	if(this.query.ids) {
		result = yield messageService.getMessagesByIdsT(imapConnection, this.params.box, this.query.ids, options);
	} else {
		result = yield messageService.getMessagesBySeqsT(imapConnection, this.params.box, this.query.seqs, options);
	}
		

	this.body = JSON.stringify(result, null, '\t');
	this.status = 200;
};
