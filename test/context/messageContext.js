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
						"World 1!"
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
					"special-use": "\\Trash"
				},
				"CustomFolderWithoutChild": {},
				"CustomFolderWithChild": {
					"folders": {
						"CustomSubFolder": {}
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
var smtpServer = simplesmtp.createSimpleServer({
	SMTPBanner: "Hoodiecrow"
}, function (req) {
	var data = [];
	var dataLen = 0;
	req.on("data", function (chunk) {
		if (!chunk || !chunk.length) {
			return;
		}
		data.push(chunk);
		dataLen += chunk.length;
	});
	req.on("end", function () {
		var message = Buffer.concat(data, dataLen);
		imapServer.appendMessage("INBOX", [], false, message.toString("binary"));
	});
	req.accept();
});

const smtpPort = conf.get('smtp:port') || 1125;
smtpServer.listen(smtpPort, function () {
	logger.info('SMTP server is now listening on ' + smtpPort);
});