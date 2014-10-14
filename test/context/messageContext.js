'use strict';
var MODULE_NAME = 'messageContext';

var logger = require('log4js').getLogger(MODULE_NAME);
var conf = require('nconf');
var hoodiecrow = require("hoodiecrow");
var simplesmtp = require("simplesmtp");


/*
 * IMAP Server
 */
var imapServer = module.exports = hoodiecrow({
	plugins: ["ID", "STARTTLS", "AUTH-PLAIN", "NAMESPACE", "IDLE", "ENABLE", "CONDSTORE", "XTOYBIRD", "LITERALPLUS", "UNSELECT", "SPECIAL-USE", "CREATE-SPECIAL-USE"],
	id: {
		name: "hoodiecrow",
		version: "0.1"
	},

	storage: {
		"INBOX": {
			messages: [
				{
					uid: 12,
					raw: "From: sender one <sender.1@example.com>\r\n" +
						"To: Me <receiver@example.com>\r\n" +
						"Subject: hello from 1\r\n" +
						"Message-Id: <1>\r\n" +
						"Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n" +
						"\r\n" +
						"World 1!"
				}, {
					uid: 13,
					raw: "From: sender two <sender.2@example.com>\r\n" +
						"To: Me <receiver@example.com>\r\n" +
						"Subject: hello from 2\r\n" +
						"Message-Id: <2>\r\n" +
						"Date: Fri, 14 Sep 2013 08:12:15 +0300\r\n" +
						"\r\n" +
						"World 2!"
				}
			]
		},
		"": {
			"separator": "+",
			"folders": {
				"Drafts": {
					"special-use": "\\Drafts"
				},
				"Sent": {
					"special-use": "\\Sent"
				},
				"Trash": {
					"special-use": "\\Trash",
					messages: [
								{
									uid: 1,
									raw: "From: sender one <sender.1@example.com>\r\n" +
										"To: Me <receiver@example.com>\r\n" +
										"Subject: Is in trash\r\n" +
										"Message-Id: <trash_1>\r\n" +
										"Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n" +
										"\r\n" +
										"I have been deleted :'("
								},
							]
				},
				"CustomFolderWithoutChild": {},
				"CustomFolderWithChild": {
					"folders": {
						"CustomSubFolder": {}
					}
				},
				"features": {
					"folders": {
						"deleteMessage": {
							messages: [
								{
									uid: 1,
									raw: "From: sender one <sender.1@example.com>\r\n" +
										"To: Me <receiver@example.com>\r\n" +
										"Subject: This message will remain\r\n" +
										"Message-Id: <deleteMessage_1>\r\n" +
										"Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n" +
										"\r\n" +
										"I will survive !"
								}, {
									uid: 2,
									raw: "From: sender two <sender.2@example.com>\r\n" +
										"To: Me <receiver@example.com>\r\n" +
										"Subject: This message will not remain\r\n" +
										"Message-Id: <deleteMessage_2>\r\n" +
										"Date: Fri, 14 Sep 2013 08:12:15 +0300\r\n" +
										"\r\n" +
										"Oh no !"
								}, {
									uid: 3,
									raw: "From: sender two <sender.2@example.com>\r\n" +
										"To: Me <receiver@example.com>\r\n" +
										"Subject: This message will be moved to trash\r\n" +
										"Message-Id: <deleteMessage_3>\r\n" +
										"Date: Fri, 14 Sep 2013 08:12:15 +0300\r\n" +
										"\r\n" +
										"Trashed !"
								}
							]
						},
					}
				}
			}
		}
	},
	debug: false
});

const imapPort = conf.get('imap:port') || 1143;
imapServer.listen(imapPort, function () {
	logger.info('IMAP server is now listening on ' + imapPort);
});



/*
 * SMTP Server
 */
var smtpServer = simplesmtp.createServer({
	debug: true,
	SMTPBanner: "Hoodiecrow",
	requireAuthentication: false,
	disableDNSValidation: true,

});

smtpServer.on('startData', function (connection) {
	logger.debug('Incomming SMTP Message (from:', connection.from + 'to:', connection.to + ')');
	connection.messageData = [];
	connection.messageDataLength = 0;
});

smtpServer.on('data', function (connection, chunk) {
	if (!chunk || !chunk.length) {
		return;
	}
	logger.debug('New message data');
	connection.messageData.push(chunk);
	connection.messageDataLength += chunk.length;
});

smtpServer.on('dataReady', function (connection, callback) {
	var message = Buffer.concat(connection.messageData, connection.messageDataLength);
	imapServer.appendMessage('INBOX', [], false, message.toString('binary'));
	logger.debug('New SMTP message delivered ' + message);

	callback(null, 'ABC1');
});

const smtpPort = conf.get('smtp:port') || 1125;
smtpServer.listen(smtpPort, function (err) {
	if (err) {
		logger.error('SMTP server failed to listen: ' + err);
	} else {
		logger.info('SMTP server is now listening on ' + smtpPort);
	}
});