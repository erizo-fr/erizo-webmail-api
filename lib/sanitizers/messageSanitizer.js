"use strict"
var sanitizerHelper = require("./sanitizerHelper")

module.exports.postMessage = function* (next) {
	this.checkBody("from").notEmpty()
	this.checkBody("to").notEmpty()
	this.checkBody("cc").optional()
	this.checkBody("bcc").optional()
	this.checkBody("replyTo").optional().trim()
	this.checkBody("inReplyTo").optional().trim()
	this.checkBody("references").optional().trim()
	this.checkBody("subject").trim().notEmpty()
	this.checkBody("text").optional().trim().default("")
	this.checkBody("html").optional().trim().default("")
	this.checkBody("attachments").optional().trim().notEmpty()
	if (!sanitizerHelper.hasError.call(this)) {
		yield next
	}
}

module.exports.getMessages = function* (next) {
	this.checkParams("box").notEmpty().match(sanitizerHelper.PATTERN_BOX)
	this.checkQuery("bodies").optional().match(sanitizerHelper.PATTERN_BODIES)
	this.checkQuery("markSeen").optional().default("false").toBoolean()
	this.checkQuery("fetchStruct").optional().default("false").toBoolean()
	this.checkQuery("fetchEnvelope").optional().default("false").toBoolean()
	this.checkQuery("fetchSize").optional().default("false").toBoolean()
	// Recompose ids array
	if ("ids" in this.query) {
		this.checkQuery("ids").notEmpty().match(sanitizerHelper.PATTERN_IDS)
	} else if ("ids[0]" in this.query) {
		let idNumber = 0
		let ids = []
		while ("ids[" + idNumber + "]" in this.query) {
			this.checkQuery("ids[" + idNumber + "]").notEmpty().match(sanitizerHelper.PATTERN_IDS)
			ids.push(this.query["ids[" + idNumber + "]"])
			idNumber += 1
		}
		this.query.ids = ids
	}

	// Recompose seqs array
	if ("seqs" in this.query) {
		this.checkQuery("seqs").notEmpty().match(sanitizerHelper.PATTERN_IDS)
	} else if ("seqs[0]" in this.query) {
		let seqNumber = 0
		let seqs = []
		while ("seqs[" + seqNumber + "]" in this.query) {
			this.checkQuery("seqs[" + seqNumber + "]").notEmpty().match(sanitizerHelper.PATTERN_IDS)
			seqs.push(this.query["seqs[" + seqNumber + "]"])
			seqNumber += 1
		}
		this.query.seqs = seqs
	}

	if ("ids" in this.query === "seqs" in this.query) {
		this.errors = "Exactly one of ids or seqs param must be given"
	}

	if (!sanitizerHelper.hasError.call(this)) {
		yield next
	}
}

module.exports.getMessage = function* (next) {
	this.checkParams("box").notEmpty().match(sanitizerHelper.PATTERN_BOX)
	this.checkParams("id").notEmpty().match(sanitizerHelper.PATTERN_ID)
	this.checkQuery("bodies").optional().match(sanitizerHelper.PATTERN_BODIES)
	this.checkQuery("markSeen").optional().default("false").toBoolean()
	this.checkQuery("fetchStruct").optional().default("false").toBoolean()
	this.checkQuery("fetchEnvelope").optional().default("false").toBoolean()
	this.checkQuery("fetchSize").optional().default("false").toBoolean()
	if (!sanitizerHelper.hasError.call(this)) {
		yield next
	}
}

module.exports.deleteMessage = function* (next) {
	this.checkParams("box").notEmpty().match(sanitizerHelper.PATTERN_BOX)
	this.checkParams("id").notEmpty().match(sanitizerHelper.PATTERN_ID)
	this.checkQuery("realDelete").optional().default("false").toBoolean()
	if (!sanitizerHelper.hasError.call(this)) {
		yield next
	}
}

module.exports.patchMessage = function* (next) {
	this.checkParams("box").notEmpty().match(sanitizerHelper.PATTERN_BOX)
	this.checkParams("id").notEmpty().match(sanitizerHelper.PATTERN_ID)
	this.checkBody("boxPath").optional()
	if (!sanitizerHelper.hasError.call(this)) {
		yield next
	}
}
