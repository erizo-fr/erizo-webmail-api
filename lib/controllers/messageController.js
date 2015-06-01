"use strict"
var imapManager = require("../managers/imapManager")
var smtpManager = require("../managers/smtpManager")
var messageService = require("../services/messageService")
var boxService = require("../services/boxService")

module.exports.postMessage = function * () {
	// Create the message object
	let message = {
		"from": this.request.body.from,
		"to": this.request.body.to,
		"cc": this.request.body.cc,
		"bcc": this.request.body.bcc,
		"replyTo": this.request.body.replyTo || this.request.body.from,
		"inReplyTo": this.request.body.inReplyTo,
		"references": this.request.body.references,
		"subject": this.request.body.subject,
		"text": this.request.body.text,
		"html": this.request.body.html,
		"attachments": this.request.body.attachments,
	}

	let smtpConnection = smtpManager.getConnection(this.session.username, this.session.password)
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password)
	let result = yield messageService.sendMessage(smtpConnection, imapConnection, message)
	this.body = result.messageId || ""
	this.status = 200
}

module.exports.getMessages = function * () {
	let options = {
		bodies: this.query.bodies,
		markSeen: this.query.markSeen,
		struct: this.query.fetchStruct,
		envelope: this.query.fetchEnvelope,
		size: this.query.fetchSize,
	}

	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password)
	let result
	if (this.query.ids) {
		result = yield messageService.getMessagesByIds(imapConnection, this.params.box, this.query.ids, options)
	} else {
		result = yield messageService.getMessagesBySeqs(imapConnection, this.params.box, this.query.seqs, options)
	}

	this.body = result
	this.status = 200
}

module.exports.getMessage = function * () {
	let options = {
		bodies: this.query.bodies,
		markSeen: this.query.markSeen,
		struct: this.query.fetchStruct,
		envelope: this.query.fetchEnvelope,
		size: this.query.fetchSize,
	}

	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password)
	let result = yield messageService.getMessagesByIds(imapConnection, this.params.box, this.params.id, options)
	// Test the result object
	if (!Array.isArray(result)) {
		throw new Error("Bad result format")
	}
	if (result.length === 0) {
		this.body = "Message not found"
		this.status = 404
		return
	} else if (result.length > 1) {
		throw new Error("Invalid server state")
	}

	let message = result[0]
	this.body = message
	this.status = 200
}

module.exports.deleteMessage = function * () {
	// Test the message existance
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password)
	let result = yield messageService.getMessagesByIds(imapConnection, this.params.box, this.params.id)
	if (result.length === 0) {
		this.body = "Message not found"
		this.status = 404
		return
	}

	// Delete the message
	if (this.query.realDelete === true) {
		yield messageService.deleteMessage(imapConnection, this.params.box, this.params.id)
	} else {
		yield messageService.moveToTrash(imapConnection, this.params.box, this.params.id)
	}

	this.status = 200
}

module.exports.patchMessage = function * () {
	// Test the message existance
	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password)
	let result = yield messageService.getMessagesByIds(imapConnection, this.params.box, this.params.id)
	if (result.length === 0) {
		this.body = "Message not found"
		this.status = 404
		return
	}

	// Move the message
	if (this.request.body.boxPath) {
		let boxExists = yield boxService.boxExists(imapConnection, this.request.body.boxPath)
		if (!boxExists) {
			this.status = 400
			this.body = "The destination box does not exist"
			return
		}
		yield messageService.moveMessage(imapConnection, this.params.box, this.params.id, this.request.body.boxPath)
	}

	this.status = 200
}
