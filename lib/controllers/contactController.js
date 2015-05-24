"use strict"
var contactService = require("../services/contactService")

module.exports.searchContacts = function * () {
	let criteria = this.query.criteria
	let limit = this.query.limit
	let result = yield contactService.searchContacts(this.session.username, this.session.password, criteria, limit)
	this.body = result
	this.status = 200
}
