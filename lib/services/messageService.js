"use strict"
var MODULE_NAME = "MessageService"
var logger = require("log4js").getLogger(MODULE_NAME)
var MessageCompiler = require("nodemailer/src/compiler")
var Q = require("q")
var imapHelper = require("../imapHelper")

/*
 * Send message
 */
module.exports.sendMessage = function * (smtpConnection, imapConnection, message) {
	logger.debug("Sending new message: " + JSON.stringify(message))

	// Send message
	let sentData = yield Q.ninvoke(smtpConnection, "sendMail", message)
	logger.info("New message sent: " + JSON.stringify(sentData))

	// Add message to sent box
	let sentBox
	try {
		logger.debug("Getting the sent box name")
		sentBox = yield imapHelper.getSentBox(imapConnection)
		if (!sentBox) {
			logger.warn("The sent box is undefined, the message can not be appended into the sent box")
		} else {
			logger.debug("Compiling the message into mime message")
			let mimeMessage = yield Q.ninvoke(new MessageCompiler(message).compile(), "build")
			logger.debug("Appending the sent message in the box#" + sentBox.path)
			yield Q.ninvoke(imapConnection, "append", mimeMessage, {
				mailbox: sentBox.path,
				flags: ["Seen", "Flagged"],
			})
		}
	} catch (err) {
		logger.error("Failed to append the message into the box#" + sentBox + ": " + err)
	}

	return sentData
}

/*
 * Get message
 */
function getMessages (imapConnection, boxName, ids, seqs, options, callback) {
	logger.info("Getting messages by seqs#" + seqs + " or ids#" + ids + " in box#" + boxName + " with options " + JSON.stringify(options))
	if (ids && seqs || (!ids && !seqs)) {
		callback(new Error("Either ids or seqs must be defined"), null)
		return
	}

	imapConnection.openBox(boxName, false, function (err) {
		if (err) {
			logger.error("Failed to open box#" + boxName + ":\n" + err)
			callback(err, null)
			return
		}

		let messages = []
		let f
		if (ids) {
			f = imapConnection.fetch(ids, options)
		} else {
			f = imapConnection.seq.fetch(seqs, options)
		}
		f.on("message", function (msg, seqno) {
			let message = {
				bodies: {},
			}
			messages.push(message)
			msg.on("body", function (stream, info) {
				logger.debug("Message#" + seqno + " part#" + info.which + " stream begin: " + info.size)
				let buffer = new Buffer([])
				stream.on("data", function (chunk) {
					buffer = Buffer.concat([buffer, chunk])
					logger.debug("Message#" + seqno + " part#" + info.which + " data received: " + chunk.length)
				})
				stream.once("end", function () {
					message.bodies[info.which] = buffer.toString("base64")
					logger.debug("Message#" + seqno + " part#" + info.which + " stream ended: " + buffer.length)
				})
			})
			msg.once("attributes", function (attrs) {
				logger.debug("Message#" + seqno + ": Attributes received")
				message.attrs = attrs
			})
		})
		f.once("error", function (err2) {
			logger.error("An error occured while fetching messages with options " + JSON.stringify(options) + ": " + JSON.stringify(err2))
			callback(err2, null)
		})
		f.once("end", function () {
			logger.debug("All messages received")
			callback(null, messages)
		})
	})
}
module.exports.getMessagesBySeqs = function * (imapConnection, boxName, seqs, options) {
	return yield Q.nfcall(getMessages, imapConnection, boxName, null, seqs, options)
}
module.exports.getMessagesByIds = function * (imapConnection, boxName, ids, options) {
	return yield Q.nfcall(getMessages, imapConnection, boxName, ids, null, options)
}

/*
 * Delete message
 */
module.exports.deleteMessage = function * (connection, boxName, id) {
	logger.info("Deleting message#" + id + " in " + boxName)
	yield Q.ninvoke(connection, "openBox", boxName, false)
	yield Q.ninvoke(connection, "addFlags", id, "\\Deleted")
	if (connection.serverSupports("UIDPLUS")) {
		yield Q.ninvoke(connection, "expunge", id)
	} else {
		yield Q.ninvoke(connection, "expunge")
	}
}
/*
 * Move message to trash
 */
module.exports.moveToTrash = function * (connection, boxName, id) {
	logger.info("Moving message#" + id + " in " + boxName + " to trash")
	let trashBox = yield imapHelper.getTrashBox(connection)
	if (!trashBox) {
		throw new Error("No trash box defined. Can not move the message to trash")
	}
	logger.debug("Trash box is: " + trashBox)
	yield Q.ninvoke(connection, "openBox", boxName, false)
	yield Q.ninvoke(connection, "move", id, trashBox.path)
}

module.exports.moveMessage = function * (connection, sourceBoxPath, id, destinationBoxPath) {
	logger.info("Moving message#" + id + " in " + sourceBoxPath + " to " + destinationBoxPath)
	yield Q.ninvoke(connection, "openBox", sourceBoxPath, false)
	yield Q.ninvoke(connection, "move", id, destinationBoxPath)
}
