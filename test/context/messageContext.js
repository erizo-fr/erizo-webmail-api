"use strict"

var MODULE_NAME = "messageContext"
var logger = require("log4js").getLogger(MODULE_NAME)
var conf = require("nconf")
var hoodiecrow = require("hoodiecrow")
var simplesmtp = require("simplesmtp")
/*
 * IMAP Server
 */
var imapServer = module.exports = hoodiecrow({
	plugins: ["ID", "STARTTLS", "AUTH-PLAIN", "NAMESPACE", "IDLE", "ENABLE", "CONDSTORE", "XTOYBIRD", "LITERALPLUS", "UNSELECT", "SPECIAL-USE", "CREATE-SPECIAL-USE"],
	id: {
		name: "hoodiecrow",
		version: "0.1",
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
						"World 1!",
				}, {
					uid: 13,
					raw: "From: sender two <sender.2@example.com>\r\n" +
						"To: Me <receiver@example.com>\r\n" +
						"Subject: hello from 2\r\n" +
						"Content-type: text/plain\n" +
						"Message-Id: <2>\r\n" +
						"Date: Fri, 14 Sep 2013 08:12:15 +0300\r\n" +
						"\r\n" +
						"World 2!",
				}, {
					uid: 14,
					raw: "Content-Type: multipart/alternative;\n" +
						" boundary=\"----sinikael-?=_1-14348981329060.8954494663048536\"\n" +
						"From: bart@localhost\n" +
						"To: bart@localhost, bart@localhost\n" +
						"Subject: 14 - Multipart\n" +
						"Date: Sun, 21 Jun 2015 14:48:52 +0000\n" +
						"Message-Id: <14>\n" +
						"MIME-Version: 1.0\n" +
						"\n" +
						"------sinikael-?=_1-14348981329060.8954494663048536\n" +
						"Content-Type: text/plain; charset=utf-8\n" +
						"Content-Transfer-Encoding: quoted-printable\n" +
						"\n" +
						"Coucou\n" +
						"------sinikael-?=_1-14348981329060.8954494663048536\n" +
						"Content-Type: text/html; format=flowed\n" +
						"Content-Transfer-Encoding: 7bit\n" +
						"\n" +
						"<div>Coucou</div>\n" +
						"------sinikael-?=_1-14348981329060.8954494663048536--\n" +
						"\n",
				}, {
					uid: 15,
					raw: "Content-Type: multipart/mixed;\n" +
					" boundary=\"----lola-?=_1.1\"\n" +
					"From: bart@localhost\n" +
					"To: bart@localhost\n" +
					"Subject: Message 15\n" +
					"Message-Id: <15-dsds>\n" +
					"MIME-Version: 1.0\n" +
					"\n" +
					"------lola-?=_1.1\n" +
					"Content-Type: multipart/alternative;\n" +
					" boundary=\"----lola-?=_2-14349004014090.9237000774592161\"\n" +
					"\n" +
					"------lola-?=_2-14349004014090.9237000774592161\n" +
					"Content-Type: text/plain\n" +
					"Content-Transfer-Encoding: 7bit\n" +
					"\n" +
					"Coucou\n" +
					"------lola-?=_2-14349004014090.9237000774592161\n" +
					"Content-Type: text/html\n" +
					"Content-Transfer-Encoding: 7bit\n" +
					"\n" +
					"<div>Coucou</div>\n" +
					"------lola-?=_2-14349004014090.9237000774592161--\n" +
					"\n" +
					"------lola-?=_1.1\n" +
					"Content-Type: text/html\n" +
					"Content-Transfer-Encoding: 7bit\n" +
					"\n" +
					"TGFzdCBwYXJ0\n" +
					"\n" +
					"------lola-?=_1.1--\n" +
					"\n",
				}, {
					uid: 16,
					raw: "Content-Type: multipart/mixed;\n" +
					" boundary=\"----lola-?=_1.1\"\n" +
					"From: bart@localhost\n" +
					"To: bart@localhost\n" +
					"Subject: Message 15\n" +
					"Message-Id: <16-dsds>\n" +
					"MIME-Version: 1.0\n" +
					"\n" +
					"------lola-?=_1.1\n" +
					"Content-Type: multipart/alternative;\n" +
					" boundary=\"----lola-?=_2-14349004014090.9237000774592161\"\n" +
					"\n" +
					"------lola-?=_2-14349004014090.9237000774592161\n" +
					"Content-Type: text/plain\n" +
					"Content-Transfer-Encoding: 7bit\n" +
					"\n" +
					"Coucou\n" +
					"------lola-?=_2-14349004014090.9237000774592161\n" +
					"Content-Type: text/html\n" +
					"Content-Transfer-Encoding: 7bit\n" +
					"\n" +
					"<div>Coucou</div>\n" +
					"------lola-?=_2-14349004014090.9237000774592161--\n" +
					"\n" +
					"------lola-?=_1.1\n" +
					"Content-Type: text/plain\n" +
					"Content-Disposition: attachment; filename=\"myAttachment_base64.txt\"\n" +
					"Content-Transfer-Encoding: base64\n" +
					"\n" +
					"Vm9pY2kgbGUgY29udGVudSBkZSBsYSBQSg==\n" +
					"\n" +
					"------lola-?=_1.1--\n" +
					"\n",
				}, {
					uid: 17,
					raw: "From: sender one <sender.1@example.com>\r\n" +
						"To: Me <receiver@example.com>\r\n" +
						"Subject: hello from 1\r\n" +
						"Message-Id: <17>\r\n" +
						"Content-Type: multipart/alternative;\n" +
						" boundary=\"----sinikael-?=_1-14365652326130.5919539076276124\"\n" +
						"Date: Fri, 10 Jul 2015 21:53:52 +0000\n" +
						"MIME-Version: 1.0\n" +
						"\n" +
						"------sinikael-?=_1-14365652326130.5919539076276124\n" +
						"Content-Type: text/plain; charset=utf-8\n" +
						"Content-Transfer-Encoding: quoted-printable\n" +
						"\n" +
						"Accents: =C3=A0=C3=A8=C3=AB=C3=A4=C3=84=C3=B9%$!:\"'}{\n" +
						"------sinikael-?=_1-14365652326130.5919539076276124\n" +
						"Content-Type: text/html; charset=utf-8\n" +
						"Content-Transfer-Encoding: quoted-printable\n" +
						"\n" +
						"<div>Accents: =C3=A0=C3=A8=C3=AB=C3=A4=C3=84=C3=B9%$!:\"'}{</div>\n" +
						"------sinikael-?=_1-14365652326130.5919539076276124--\n",
				}, {
					uid: 18,
					raw: "From: sender one <sender.1@example.com>\r\n" +
						"To: Me <receiver@example.com>\r\n" +
						"Subject: hello from 1\r\n" +
						"Content-Type: multipart/alternative;\n" +
						" boundary=\"----sinikael-?=_1-14365652326130.5919539076276124\"\n" +
						"Date: Fri, 10 Jul 2015 21:53:52 +0000\n" +
						"Message-Id: <8>\n" +
						"MIME-Version: 1.0\n" +
						"\n" +
						"------sinikael-?=_1-14365652326130.5919539076276124\n" +
						"Content-Type: text/plain; charset=iso-8859-1\n" +
						"Content-Transfer-Encoding: quoted-printable\n" +
						"\n" +
						"Accents: =E0=E8=EB=E4=C4=F9%$!:\"'}{\n" +
						"------sinikael-?=_1-14365652326130.5919539076276124\n" +
						"Content-Type: text/html; charset=iso-8859-1\n" +
						"Content-Transfer-Encoding: quoted-printable\n" +
						"\n" +
						"<div>Accents: =E0=E8=EB=E4=C4=F9%$!:\"'}{</div>\n" +
						"------sinikael-?=_1-14365652326130.5919539076276124--\n",
				},
			],
		},
		"": {
			"separator": "+",
			"folders": {
				"Drafts": {
					"special-use": "\\Drafts",
				},
				"Sent": {
					"special-use": "\\Sent",
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
								"I have been deleted :'(",
								},
							],
				},
				"CustomFolderWithoutChild": {},
				"CustomFolderWithChild": {
					"folders": {
						"CustomSubFolder": {},
					},
				},
				"features": {
					"folders": {
						"createBox": {
							"folders": {
								"thisBoxExists": {},
							},
						},
						"deleteBox": {
							"folders": {
								"thisBoxExists": {},
							},
						},
						"patchBox": {
							"folders": {
								"scenarioInvalidParam": {},
								"scenarioPathChange": {},
							},
						},
						"getMessage": {
							"messages": [
								{
									uid: 1,
									raw: "From: sender one <sender.1@example.com>\r\n" +
										"To: Me <receiver@example.com>\r\n" +
										"Subject: This message will be marked as seen\r\n" +
										"Message-Id: <getMessage_1>\r\n" +
										"Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n" +
										"\r\n" +
										"Hidden but not for long",
								}, {
									uid: 2,
									raw: "From: sender one <sender.1@example.com>\r\n" +
										"To: Me <receiver@example.com>\r\n" +
										"Subject: This message will not be marked as seen\r\n" +
										"Message-Id: <getMessage_2>\r\n" +
										"Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n" +
										"\r\n" +
										"Hidden",
								}, {
									uid: 3,
									raw: "From: sender one <sender.1@example.com>\r\n" +
										"To: Me <receiver@example.com>\r\n" +
										"Subject: Yo subject\r\n" +
										"Message-Id: <getMessage_3>\r\n" +
										"Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n" +
										"\r\n" +
										"Yo",
								},
							],
						},
						"deleteMessage": {
							"messages": [
								{
									uid: 1,
									raw: "From: sender one <sender.1@example.com>\r\n" +
										"To: Me <receiver@example.com>\r\n" +
										"Subject: This message will remain\r\n" +
										"Message-Id: <deleteMessage_1>\r\n" +
										"Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n" +
										"\r\n" +
										"I will survive !",
								}, {
									uid: 2,
									raw: "From: sender two <sender.2@example.com>\r\n" +
										"To: Me <receiver@example.com>\r\n" +
										"Subject: This message will not remain\r\n" +
										"Message-Id: <deleteMessage_2>\r\n" +
										"Date: Fri, 14 Sep 2013 08:12:15 +0300\r\n" +
										"\r\n" +
										"Oh no !",
								}, {
									uid: 3,
									raw: "From: sender two <sender.2@example.com>\r\n" +
										"To: Me <receiver@example.com>\r\n" +
										"Subject: This message will be moved to trash\r\n" +
										"Message-Id: <deleteMessage_3>\r\n" +
										"Date: Fri, 14 Sep 2013 08:12:15 +0300\r\n" +
										"\r\n" +
										"Trashed !",
								},
							],
						},
						"moveMessage": {
							"folders": {
								"src": {
									"messages": [
										{
											uid: 1,
											raw: "From: sender one <sender.1@example.com>\r\n" +
												"To: Me <receiver@example.com>\r\n" +
												"Subject: Move a message to another box\r\n" +
												"Message-Id: <moveMessage_src_1>\r\n" +
												"Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n" +
												"\r\n" +
												"Don't take me :(",
										},
										{
											uid: 2,
											raw: "From: sender one <sender.1@example.com>\r\n" +
												"To: Me <receiver@example.com>\r\n" +
												"Subject: This message will not be moved\r\n" +
												"Message-Id: <moveMessage_src_2>\r\n" +
												"Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n" +
												"\r\n" +
												"Won't move !",
										},
									],
								},
								"dst": {
									"messages": [
									],
								},
							},
						},
					},
				},
			},
		},
	},
	debug: false,
})
const imapPort = conf.get("imap:port") || 1143
imapServer.listen(imapPort, function () {
	logger.info("IMAP server is now listening on " + imapPort)
})
/*
 * SMTP Server
 */
var smtpServer = simplesmtp.createServer({
	debug: true,
	SMTPBanner: "Hoodiecrow",
	requireAuthentication: false,
	disableDNSValidation: true,

})
smtpServer.on("startData", function (connection) {
	logger.debug("Incomming SMTP Message (from:", connection.from + "to:", connection.to + ")")
	connection.messageData = []
	connection.messageDataLength = 0
})
smtpServer.on("data", function (connection, chunk) {
	if (!chunk || !chunk.length) {
		return
	}
	logger.debug("New message data")
	connection.messageData.push(chunk)
	connection.messageDataLength += chunk.length
})
smtpServer.on("dataReady", function (connection, callback) {
	var message = Buffer.concat(connection.messageData, connection.messageDataLength)
	imapServer.appendMessage("INBOX", [], false, message.toString("binary"))
	logger.debug("New SMTP message delivered " + message)
	callback(null, "ABC1")
})
const smtpPort = conf.get("smtp:port") || 1125
smtpServer.listen(smtpPort, function (err) {
	if (err) {
		logger.error("SMTP server failed to listen: " + err)
	} else {
		logger.info("SMTP server is now listening on " + smtpPort)
	}
})
