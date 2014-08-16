'use strict';

var MODULE_NAME = 'MessageService';
var logger = require('log4js').getLogger(MODULE_NAME);
var Imap = require('imap');

module.exports.getMessages = function (imapConnection, boxName, ids, options, callback) {	
	logger.debug('Getting messages#' + ids + ' in box#' + boxName + ' with options ' + JSON.stringify(options));
	imapConnection.openBox(boxName, true, function(err, box) {
		if(err) {
			logger.debug('Failed to open box#' + boxName + ':\n' + err);
			callback(err, null);
			return;
		}

		var messages = [];
		var f = imapConnection.seq.fetch(ids, options);
		f.on('message', function(msg, seqno) {
			let message = {};
			messages.push(message);
			msg.on('body', function(stream, info) {
				logger.debug('Message#' + seqno + ': Body stream begin');
				var buffer = '';
				stream.on('data', function(chunk) {
					buffer += chunk.toString('utf8');
				});
				stream.once('end', function() {
					logger.debug('Message#' + seqno + ': Body received');
					message.body = Imap.parseHeader(buffer);
				});
			});
			msg.once('attributes', function(attrs) {
				logger.debug('Message#' + seqno + ': Attributes received');
				message.attrs = attrs;
			});
		});
		f.once('error', function(err) {
			logger.error('An error occured while fetching messages with options ' + JSON.stringify(options));
			callback(err, null);
		});
		f.once('end', function() {
			logger.debug('All messages received');
			callback(null, messages);
		});
	});
};
module.exports.getMessagesT = function (imapConnection, boxName, ids, options) {
	return function(callback) {
		module.exports.getMessages(imapConnection, boxName, ids, options, callback);
	};
};
