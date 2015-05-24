"use strict"
var MODULE_NAME = "imapManager"
var logger = require("log4js").getLogger(MODULE_NAME)
var conf = require("nconf")
var Imap = require("imap")
// Connection pool
var connections = {}

function createImapConnection (username, password) {
	let host = conf.get("imap:host") || "localhost"
	let port = conf.get("imap:port") || 143
	let tls = conf.get("imap:tls") || false
	let autotls = conf.get("imap:autotls") || "never"
	logger.debug("Create raw connection object for user#" + username + " to " + host + ":" + port + " with options (tls=" + tls + ", autotls=" + autotls + ")")
	return new Imap({
		user: username,
		password: password,
		host: host,
		port: port,
		tls: tls,
		autotls: autotls,
		debug: function (log) {
			logger.debug(log)
		},
	})
}

function closeConnection (username) {
	var connection = connections[username]
	connections[username] = null
	logger.debug("Closing the connection of user#" + username)
	connection.connection.end()
}

function resetTimeout (username) {
	// Cancel the previous timeout
	if (connections[username].timeoutId) {
		logger.debug("Delete timeout#" + connections[username].timeoutId + " for connection of user#" + username)
		clearTimeout(connections[username].timeoutId)
	}

	// Set the new timeout
	var keepalive = conf.get("imap:keepalive") || 60000
	connections[username].timeoutId = setTimeout(function () {
		logger.debug("The connection of the user#" + username + " has expired")
		closeConnection(username)
	}, keepalive)
	logger.debug("New timeout created (id#" + connections[username].timeoutId + " for connection of user#" + username)
}

function createConnection (username, password) {
	logger.debug("Create connection structure for user#" + username)
	connections[username] = {
		"connection": createImapConnection(username, password),
		"callbacks": [],
		"isInitialized": false,
		"timeoutId": null,
	}
	connections[username].connection.once("ready", function () {
		var connection = connections[username]
		connection.isInitialized = true
		// Call callbacks
		logger.debug("Connection ready, calling callbacks")
		for (var i = 0; i < connection.callbacks.length; i++) {
			connection.callbacks[i](null, connection.connection)
		}
		connection.callbacks = []
		// Set timeout
		resetTimeout(username)
	})
	connections[username].connection.once("error", function (err) {
		logger.error("Connection error")
		var callbacks = connections[username].callbacks
		logger.debug("Closing connection")
		closeConnection(username)
		logger.debug("Calling callbacks")
		for (var i = 0; i < callbacks.length; i++) {
			callbacks[i](err, null)
		}
	})
	connections[username].connection.connect()
}

module.exports.getConnection = function (username, password, callback) {
	var connection = createImapConnection(username, password)
	connection.once("ready", function () {
		callback(null, connection)
	})
	connection.once("error", function (err) {
		callback(err, null)
	})
	connection.connect()
}

module.exports.getConnectionT = function (username, password) {
	return function (callback) {
		module.exports.getConnection(username, password, callback)
	}
}

module.exports.getKeepAliveConnection = function (username, password, callback) {
	if (!connections[username]) {
		logger.debug("No active connection found for user#" + username)
		createConnection(username, password)
	}

	if (!connections[username].isInitialized) {
		logger.debug("Imap connection for user#" + username + " is not initialized yet. Pushing callback into the callbacks list")
		connections[username].callbacks.push(callback)
	} else {
		logger.debug("Imap connection for user#" + username + " is already initialized")
		resetTimeout(username)
		callback(null, connections[username].connection)
	}
}
module.exports.getKeepAliveConnectionT = function (username, password) {
	return function (callback) {
		module.exports.getKeepAliveConnection(username, password, callback)
	}
}
