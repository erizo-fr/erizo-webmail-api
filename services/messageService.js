'use strict';

var MODULE_NAME = 'MessageService';
var logger = require('log4js').getLogger(MODULE_NAME);
var Imap = require('imap');

module.exports.getMessagesBySeqs = function (imapConnection, boxName, seqs, options, callback) {
	return getMessages(imapConnection, boxName, null, seqs, options, callback);
};
module.exports.getMessagesBySeqsT = function (imapConnection, boxName, seqs, options) {
	return function (callback) {
		module.exports.getMessagesBySeqs(imapConnection, boxName, seqs, options, callback);
	};
};

module.exports.getMessagesByIds = function (imapConnection, boxName, ids, options, callback) {
	return getMessages(imapConnection, boxName, ids, null, options, callback);
};
module.exports.getMessagesByIdsT = function (imapConnection, boxName, ids, options) {
	return function (callback) {
		module.exports.getMessagesByIds(imapConnection, boxName, ids, options, callback);
	};
};

module.exports.sendMessage = function (smtpConnection, message, callback) {
	return sendMessage(smtpConnection, message, callback);
};
module.exports.sendMessageT = function (smtpConnection, message) {
	return function (callback) {
		module.exports.sendMessage(smtpConnection, message, callback);
	};
};




function getMessages(imapConnection, boxName, ids, seqs, options, callback) {
	logger.info('Getting messages by seqs#' + seqs + ' or ids#' + ids + ' in box#' + boxName + ' with options ' + JSON.stringify(options));
	if (ids && seqs || (!ids && !seqs)) {
		let err = new Error('Either ids or seqs must be defined');
		callback(err, null);
		return;
	}

	imapConnection.openBox(boxName, true, function (err, box) {
		if (err) {
			logger.error('Failed to open box#' + boxName + ':\n' + err);
			callback(err, null);
			return;
		}

		let messages = [];
		let f;
		if (ids) {
			f = imapConnection.fetch(ids, options);
		} else {
			f = imapConnection.seq.fetch(seqs, options);
		}
		f.on('message', function (msg, seqno) {
			let message = {
				bodies: {}
			};
			messages.push(message);
			msg.on('body', function (stream, info) {
				logger.debug('Message#' + seqno + ': Body stream begin');
				message.bodies[info.which] = '';
				stream.on('data', function (chunk) {
					logger.debug('chunk:' + chunk.toString('utf8'));
					message.bodies[info.which] += chunk.toString('utf8');
				});
				stream.once('end', function () {
					logger.debug('Message#' + seqno + ': Body [' + info.wich + '] received');

				});


			});
			msg.once('attributes', function (attrs) {
				logger.debug('Message#' + seqno + ': Attributes received');
				message.attrs = attrs;
			});
		});
		f.once('error', function (err) {
			logger.error('An error occured while fetching messages with options ' + JSON.stringify(options) + ': ' + JSON.stringify(err));
			callback(err, null);
		});
		f.once('end', function () {
			logger.debug('All messages received');
			callback(null, messages);
		});
	});
}

function sendMessage(smtpConnection, message, callback) {
	logger.info('Sending a new message');

	smtpConnection.sendMail(message, function (err, info) {
		if (err) {
			logger.error('Failed to send message: ' + err);
		} else {
			logger.debug('Message sent: ' + info.response);
		}
		callback(err, info);
	});
}