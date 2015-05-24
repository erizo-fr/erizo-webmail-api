"use strict"
var sanitizerHelper = require("./sanitizerHelper")

module.exports.searchContacts = function * (next) {
	this.checkQuery("criteria").notEmpty()
	this.checkQuery("limit").optional().default("10").isInt().toInt().gt(0)
	if (!sanitizerHelper.hasError.call(this)) {
		yield next
	}
}
