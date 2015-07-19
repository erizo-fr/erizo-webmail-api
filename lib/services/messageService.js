"use strict"
var MODULE_NAME = "MessageService"
var logger = require("log4js").getLogger(MODULE_NAME)
var MessageCompiler = require("nodemailer/src/compiler")
var Q = require("q")
var imapHelper = require("../helpers/imapHelper")

/*
 * Send message
 */
module.exports.sendMessage = function * (smtpConnection, imapConnection, message) {
	// Send message
	logger.debug("Sending new message")
	let sentData = yield Q.ninvoke(smtpConnection, "sendMail", message)
	logger.info("New message sent")

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
			logger.debug("Bufferize the message")
			let buffer = new Buffer(mimeMessage)
			logger.debug("Appending the sent message in the box#" + sentBox.path)
			yield Q.ninvoke(imapConnection, "append", buffer, {
				mailbox: sentBox.path,
				flags: ["Seen", "Flagged"],
			})
			logger.debug("Message appended")
		}
	} catch (err) {
		logger.error("Failed to append the message into the box#" + sentBox + ": " + err)
	}

	return sentData
}

/*
 * Get message
 */
function getMessageInOpenBox (connection, messageRefs, options, callback) {
	let messages = []
	let f = connection.fetch(messageRefs, options)
	f.on("message", function (msg, seqno) {
		logger.debug("Receiving message#" + seqno)
		let message = {
			bodies: {},
		}
		messages.push(message)
		msg.on("body", function (stream, info) {
			logger.debug("Message#" + seqno + " part#" + info.which + " stream begin: " + info.size)
			message.bodies[info.which] = stream
		})
		msg.once("attributes", function (attrs) {
			logger.debug("Message#" + seqno + ": Attributes received")
			message.attrs = attrs
		})
	})
	f.once("error", function (err) {
		logger.error("An error occured while fetching messages with options " + JSON.stringify(options) + ": " + JSON.stringify(err))
		callback(err, null)
	})
	f.once("end", function () {
		logger.debug("All messages received")
		callback(null, messages)
	})
}

module.exports.getMessages = function * (imapConnection, boxName, ids, seqs, options) {
	logger.info("Getting messages by seqs#" + seqs + " or ids#" + ids + " in box#" + boxName + " with options " + JSON.stringify(options))
	if (ids && seqs || (!ids && !seqs)) {
		throw new Error("Either ids or seqs must be defined")
	}
	let connection = ids ? imapConnection : imapConnection.seq
	let messageRefs = ids ? ids : seqs

	// Open the box
	yield Q.ninvoke(connection, "openBox", boxName, false)

	// Add seen flags if there is no bodies (since the imap commande "fetch <SEQ> (BODY)" won't be used)
	if (options && options.markSeen && !options.bodies) {
		yield Q.ninvoke(connection, "addFlags", messageRefs, "\\Seen")
	}

	// Fetch the messages
	return yield Q.nfcall(getMessageInOpenBox, connection, messageRefs, options)
}

module.exports.getMessagesBySeqs = function * (imapConnection, boxName, seqs, options) {
	return yield module.exports.getMessages(imapConnection, boxName, null, seqs, options)
}

module.exports.getMessagesByIds = function * (imapConnection, boxName, ids, options) {
	return yield module.exports.getMessages(imapConnection, boxName, ids, null, options)
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
