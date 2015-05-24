"use strict"
var sanitizerHelper = require("./sanitizerHelper")

module.exports.login = function * (next) {
	this.checkBody("username").notEmpty().match(sanitizerHelper.PATTERN_USERNAME)
	this.checkBody("password").notEmpty().match(sanitizerHelper.PATTERN_PASSWORD)
	if (!sanitizerHelper.hasError.call(this)) {
		yield next
	}
}

module.exports.logout = function * (next) {
	if (!sanitizerHelper.hasError.call(this)) {
		yield next
	}
}
