"use strict"
var MODULE_NAME = "AuthService"
var logger = require("log4js").getLogger(MODULE_NAME)
var imapManager = require("../managers/imapManager")

module.exports.login = function * (username, password, session) {
	logger.debug("New auth attempt user#" + username)
	let connection = yield imapManager.getConnectionT(username, password)
	if (connection) {
		logger.debug("Closing connection after auth attempt")
		connection.end()
	}

	logger.info("Server accepted the auth attempt of user#" + username)
	session.username = username
	session.password = password
}
