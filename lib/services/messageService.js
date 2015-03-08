'use strict';

var MODULE_NAME = 'MessageService';
var logger = require('log4js').getLogger(MODULE_NAME);
var MessageCompiler = require('nodemailer/src/compiler');
var Q = require('q');
var imapHelper = require('../imapHelper');



/*
 * Send message
 */

module.exports.sendMessage = function * (smtpConnection, imapConnection, message) {
	logger.info('Sending a new message');
	logger.debug('Message=' + JSON.stringify(message));
    
    //Send message
	let sentData = yield Q.ninvoke(smtpConnection, 'sendMail', message);

    //Add message to sent box
	let sentBox;
	try {
		logger.debug('Getting the sent box name');
		sentBox = yield imapHelper.getSentBox(imapConnection);
		if (!sentBox) {
			logger.warn('The sent box is undefined, the message can not be appended into the sent box');
		} else {
			logger.debug('Compiling the message into mime message');
			let mimeMessage = yield Q.ninvoke(new MessageCompiler(message).compile(), 'build');

			logger.debug('Appending the sent message in the box#' + sentBox.path);
			yield Q.ninvoke(imapConnection, 'append', mimeMessage, {
				mailbox: sentBox.path,
				flags: ['Seen', 'Flagged']
			});
		}
	} catch (err) {
		logger.error('Failed to append the message into the box#' + sentBox + ': ' + err);
	}

	return sentData;
};


/*
 * Get message
 */

module.exports.getMessagesBySeqs = function * (imapConnection, boxName, seqs, options) {
	return yield Q.nfcall(getMessages, imapConnection, boxName, null, seqs, options);
};

module.exports.getMessagesByIds = function * (imapConnection, boxName, ids, options) {
	return yield Q.nfcall(getMessages, imapConnection, boxName, ids, null, options);
};

function getMessages(imapConnection, boxName, ids, seqs, options, callback) {
	logger.info('Getting messages by seqs#' + seqs + ' or ids#' + ids + ' in box#' + boxName + ' with options ' + JSON.stringify(options));
	if (ids && seqs || (!ids && !seqs)) { 
		callback(new Error('Either ids or seqs must be defined'), null);
		return;
	}

	imapConnection.openBox(boxName, false, function (err, box) {
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

/*
 * Delete message
 */
module.exports.deleteMessage = function * (connection, boxName, id) {
	logger.debug('Deleting message#' + id + ' in ' + boxName);

	yield Q.ninvoke(connection, 'openBox', boxName, false);
	yield Q.ninvoke(connection, 'addFlags', id, '\\Deleted');

	if (connection.serverSupports('UIDPLUS')) {
		yield Q.ninvoke(connection, 'expunge', id);
	} else {
		yield Q.ninvoke(connection, 'expunge');
	}
};

/*
 * Move message to trash
 */
module.exports.moveToTrash = function * (connection, boxName, id) {
    logger.debug('Moving message#' + id + ' in ' + boxName + ' to trash');

    let trashBox = yield imapHelper.getTrashBox(connection);
    if(! trashBox) {
        throw new Error('No trash box defined. Can not move the message to trash');
    }
    logger.debug('Trash box is: ' + trashBox);
    yield Q.ninvoke(connection, 'openBox', boxName, false);
    yield Q.ninvoke(connection, 'move', id, trashBox.path);
};



