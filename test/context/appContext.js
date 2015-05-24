"use strict"

var MODULE_NAME = "appContext"
require("log4js").configure("./test/conf/log4js.json")
var logger = require("log4js").getLogger(MODULE_NAME)
var nconf = require("nconf")
require("./messageContext")
require("./davContext")

var app = require("../../lib/app")
var request = require("supertest").agent(app.listen())

module.exports.request = request

module.exports.login = function (callback, username, password) {
	logger.debug("Perform login request")
	let body = {
		username: username || "testuser",
		password: password || "testpass",
	}
	request.post("/login")
		.send(body)
		.expect(200)
		.end(function (err, res) {
			logger.debug("Login request returned")
			callback(err, res)
		})
}

module.exports.logout = function (callback) {
	logger.debug("Perform logout request")
	request.post("/logout")
		.expect(200)
		.end(function (err, res) {
			logger.debug("Logout request returned")
			callback(err, res)
		})
}

// Load the configuration
nconf.env().argv()
nconf.defaults({
	"app": {
		"user": {
			"defaultIdentity": "%LOGIN@testdomain",
		},
	},
	"imap": {
		"host": "localhost",
		"port": 1143,
	},
	"smtp": {
		"host": "localhost",
		"name": "localhost",
		"port": 1125,
		"authRequired": false,
	},
})
