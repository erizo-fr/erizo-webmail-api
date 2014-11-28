'use strict';
var MODULE_NAME = 'MessageSanitizer';

var logger = require('log4js').getLogger(MODULE_NAME);
var sanitizerHelper = require('./sanitizerHelper');


module.exports.postMessage = function * (next) {
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
	
	yield next;
};



module.exports.getMessages = function * (next) {
	this.checkParams('box').notEmpty().match(sanitizerHelper.PATTERN_BOX);
	this.checkQuery('ids').optional().notEmpty().match(sanitizerHelper.PATTERN_IDS);
	this.checkQuery('seqs').optional().notEmpty().match(sanitizerHelper.PATTERN_IDS);
	this.checkQuery('bodies').optional().match(sanitizerHelper.PATTERN_BODIES);
	this.checkQuery('markSeen').optional().default('false').toBoolean();
	this.checkQuery('fetchStruct').optional().default('false').toBoolean();
	this.checkQuery('fetchEnvelope').optional().default('false').toBoolean();
	this.checkQuery('fetchSize').optional().default('false').toBoolean();
	if (this.errors) {
		this.status = 400;
		this.body = this.errors;
		logger.debug('Bad arguments: ' + this.errors);
		return;
	}
	if ('ids' in this.query === 'seqs' in this.query) {
		this.status = 400;
		this.body = 'Only one of ids or seqs param must be given';
		logger.debug('No ids or seqs given');
		return;
	}
	
	yield next;
};



module.exports.getMessage = function * (next) {
	this.checkParams('box').notEmpty().match(sanitizerHelper.PATTERN_BOX);
	this.checkParams('id').notEmpty().match(sanitizerHelper.PATTERN_ID);
	this.checkQuery('bodies').optional().match(sanitizerHelper.PATTERN_BODIES);
	this.checkQuery('markSeen').optional().default('false').toBoolean();
	this.checkQuery('fetchStruct').optional().default('false').toBoolean();
	this.checkQuery('fetchEnvelope').optional().default('false').toBoolean();
	this.checkQuery('fetchSize').optional().default('false').toBoolean();
	if (this.errors) {
		this.status = 400;
		this.body = this.errors;
		logger.debug('Bad arguments: ' + this.errors);
		return;
	}

	yield next;
};




module.exports.deleteMessage = function * (next) {
	this.checkParams('box').notEmpty().match(sanitizerHelper.PATTERN_BOX);
	this.checkParams('id').notEmpty().match(sanitizerHelper.PATTERN_ID);
	this.checkQuery('realDelete').optional().default('false').toBoolean();
	if (this.errors) {
		this.status = 400;
		this.body = this.errors;
		logger.debug('Bad arguments: ' + this.errors);
		return;
	}
	
	yield next;
};