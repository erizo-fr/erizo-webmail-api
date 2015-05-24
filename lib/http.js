"use strict"
var MODULE_NAME = "http"
var logger = require("log4js").getLogger(MODULE_NAME)
var http = require("http")

module.exports.createServer = function (app, port) {
	logger.debug("Create http server")
	var server = http.createServer(app.callback())
	logger.debug("Http server is created")
	server.on("listening", function () {
		logger.warn("HTTP server is now bound on " + port)
	})
	server.on("error", function (err) {
		if (err.code === "EADDRINUSE") {
			logger.fatal("Unable to bind the server on port " + port + ": Socket already in use")
		} else {
			logger.fatal("Error in the HTTP server: " + err)
		}

		process.exit(1)
	})
	logger.debug("Binding socket to port " + port)
	server.listen(port)
	return server
}
