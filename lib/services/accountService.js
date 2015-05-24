"use strict"
var MODULE_NAME = "AccountService"
var logger = require("log4js").getLogger(MODULE_NAME)
var mongoManager = require("../managers/mongoManager")
var conf = require("nconf")
module.exports.getUserData = function * (username) {
	logger.debug("Getting userdata of user#" + username)
	var defaultIdentity = conf.get("app:user:defaultIdentity")
	if (defaultIdentity) {
		defaultIdentity = defaultIdentity.replace("%LOGIN", username)
	} else {
		defaultIdentity = username
	}

	return {
		defaultIdentity: defaultIdentity,
	}
}
module.exports.getUserPreferences = function * (username) {
	logger.debug("Getting preferences of user#" + username)
	// Prepare the query
	let query = mongoManager.models.UserPreferences.findOne({
		_id: username,
	}).lean()
	// Execute the query
	let result = yield query.exec()
	logger.debug("Preferences of user#" + username + ": " + JSON.stringify(result))
	if (!result) {
		result = {}
	}
	return result
}
module.exports.updateUserPreferences = function * (username, preferences) {
	delete preferences._id
	logger.debug("Update preferences of user#" + username + " with " + JSON.stringify(preferences))
	// Create or replace the saved data
	let query = mongoManager.models.UserPreferences.update({
		_id: username,
	}, preferences, {
		upsert: true,
	})
	yield query.exec()
}
