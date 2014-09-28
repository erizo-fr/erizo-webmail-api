'use strict';
var MODULE_NAME = 'MessageController';

var logger = require('log4js').getLogger(MODULE_NAME);
var imapManager = require('../imapManager');
var smtpManager = require('../smtpManager');
var messageService = require('../services/messageService');

var PATTERN_IDS = new RegExp('^(\\d+(:\\d+)?)(,(\\d+(:\\d+)?))*$');
var ALLOWED_BODIES = ['HEADER', 'TEXT', '']; //TODO: Change it to a regex
var DEFAULT_BODIES = '';


module.exports.postMessage = function *() {
	this.checkBody('from').notEmpty().trim();
	this.checkBody('to').notEmpty().trim().notEmpty();
	this.checkBody('cc').optional().trim().notEmpty();
	this.checkBody('bcc').optional().trim().notEmpty();
	this.checkBody('replyTo').optional().trim().notEmpty();
	this.checkBody('inReplyTo').optional().trim().notEmpty();
	this.checkBody('references').optional().trim().notEmpty();
	this.checkBody('subject').trim().notEmpty();
	this.checkBody('text').optional().trim().default('');
	this.checkBody('html').optional().trim().default('');
	this.checkBody('attachments').optional().trim().notEmpty();
	
	if (this.errors) {
		this.status = 400;
        this.body = this.errors;
        return;
    }
	
	//Create the message object
	let message = {
		'from': this.request.body.from,
		'to': this.request.body.to,
		'cc': this.request.body.cc,
		'bcc': this.request.body.bcc,
		'replyTo': this.request.body.replyTo || this.request.body.from,
		'inReplyTo': this.request.body.inReplyTo,
		'references': this.request.body.references,
		'subject': this.request.body.subject,
		'text': this.request.body.text,
		'html': this.request.body.html,
		'attachments': this.request.body.attachments,
	};
	
	let smtpConnection = smtpManager.getConnection(this.session.username, this.session.password); 
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password);
	let result = yield messageService.sendMessage(smtpConnection, imapConnection, message);
	
	this.body = result.messageId || '';
	this.status = 200;
};


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
		result = yield messageService.getMessagesByIds(imapConnection, this.params.box, this.query.ids, options);
	} else {
		result = yield messageService.getMessagesBySeqs(imapConnection, this.params.box, this.query.seqs, options);
	}
		

	this.body = JSON.stringify(result, null, '\t');
	this.status = 200;
};
