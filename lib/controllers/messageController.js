"use strict"
var MODULE_NAME = "MessageService"
var logger = require("log4js").getLogger(MODULE_NAME)
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

function getPartAttributes (partIds, structure, recomposedPartId) {
	let partId = partIds[0]
	let otherPartIds = partIds.slice(1)
	let newRecomposedPartId = recomposedPartId ? recomposedPartId + "." : ""
	newRecomposedPartId += partId

	logger.debug("Try to find attributes of part#" + newRecomposedPartId + "/" + JSON.stringify(partIds) + " in " + JSON.stringify(structure))

	if (structure.length === 1 && otherPartIds.length === 0 && structure[0].partID === newRecomposedPartId) {
		// Body part
		logger.debug("Attributes of part#" + newRecomposedPartId + " found")
		return structure[0]
	} else if (structure.length > 1) {
		// Multi part
		let substructure = structure[parseInt(partId)]
		if (substructure.length === 1) {
			// Subpart is a body part
			return getPartAttributes(partIds, substructure, recomposedPartId)
		} else {
			// Subpart is a multi part
			return getPartAttributes(otherPartIds, substructure, newRecomposedPartId)
		}
	}
}

function* getMessagePart () {
	let options = {
		bodies: this.params.partId,
		markSeen: false,
		struct: true,
		envelope: false,
		size: false,
	}

	let imapConnection = yield imapManager.getKeepAliveConnectionT(this.session.username, this.session.password)
	let result = yield messageService.getMessagesByIds(imapConnection, this.params.box, this.params.id, options)

	// Test the result object
	if (!Array.isArray(result)) {
		throw new Error("Bad result format")
	}
	if (result.length === 0) {
		return null
	} else if (result.length > 1) {
		throw new Error("Invalid server state")
	}
	if (!result[0].bodies || !result[0].bodies[this.params.partId]) {
		throw new Error("Invalid server state")
	}

	return {
		content: result[0].bodies[this.params.partId],
		attributes: getPartAttributes(this.params.partId.split("."), result[0].attrs.struct),
	}

}

module.exports.getMessagePart = function * () {
	let part = yield getMessagePart.apply(this)
	if (!part) {
		this.body = "Message not found"
		this.status = 404
	} else {
		this.body = part
		this.status = 200
	}
}

module.exports.getMessagePartContent = function * () {
	let part = yield getMessagePart.apply(this)

	// Init default values
	let type = ""
	let subtype = ""
	let contentType = "application/octet-stream"
	let filename = "attachment"

	// Try to improve values
	let attributes = part.attributes
	if (attributes) {
		if (attributes.type) {
			type = attributes.type
		}
		if (attributes.subtype) {
			subtype = attributes.subtype
		}
		if (attributes.disposition && attributes.disposition.params && attributes.disposition.params.filename) {
			filename = attributes.disposition.params.filename
		}
	}

	this.response.attachment(filename)
	this.status = 200
	this.type = type && subtype ? type + "/" + subtype : contentType
	this.body = part.content
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
