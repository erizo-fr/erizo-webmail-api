'use strict';
var MODULE_NAME = 'imapContext';

var logger = require('log4js').getLogger(MODULE_NAME);
var conf = require('nconf');
var hoodiecrow = require("hoodiecrow");

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

const port = conf.get('imap:port') || 1143;
imapServer.listen(port, function () {
	logger.info('Imap server is now listening on ' + port);
});