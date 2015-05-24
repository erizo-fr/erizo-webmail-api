"use strict"
let MODULE_NAME = "ContactService"
let logger = require("log4js").getLogger(MODULE_NAME)
let davManager = require("../managers/davManager")
let vcardparser = require("vcardparser")
let Q = require("q")

module.exports.searchContacts = function* (username, password, criteria, limit) {
	logger.debug("Get contacts by name or email: " + criteria)
	let response =
		yield davManager.searchContactsByFnOrEmail(criteria, username, password)
	logger.debug("Filtering contacts without email fields")
	let vcards = []
	for (let i = 0; i < response.length; i++) {
		if (vcards.length >= limit) {
			logger.debug("Limit reached (" + limit + ") Returning " + vcards.length + " contacts")
			break
		}
		let vcard = yield Q.nfcall(vcardparser.parseString, response[i])
		if (vcard.email) {
			vcards.push(vcard)
		}
	}

	return vcards
}
