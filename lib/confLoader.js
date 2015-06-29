"use strict"
var MODULE_NAME = "confLoader"
var logger = require("log4js").getLogger(MODULE_NAME)
var conf = require("nconf")

// Initialization
module.exports.load = function () {
	logger.info("Load configurations")

	// Load ARGV
	conf.argv({
		"c": {
			alias: "confgFile",
			describe: "Configuration file path",
			demand: true,
			default: "./conf/conf.json",
		},
	})

	// Load Env conf
	conf.env()

	// Load configuration file
	let configurationFilePath = conf.get("c")
	logger.debug("Load conf file: " + configurationFilePath)
	conf.file(configurationFilePath)

	logger.debug("Configuration: \n" + JSON.stringify(conf.get(), null, "\t"))
}
