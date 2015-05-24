"use strict"
module.exports.PATTERN_BODIES = new RegExp("^.*$") // TODO
module.exports.PATTERN_USERNAME = new RegExp("^.*$") // TODO
module.exports.PATTERN_PASSWORD = new RegExp("^.*$") // TODO
module.exports.PATTERN_BOX = new RegExp("^.*$") // TODO
module.exports.PATTERN_IDS = new RegExp("^(\\d+(:\\d+)?)(,(\\d+(:\\d+)?))*$")
module.exports.PATTERN_ID = new RegExp("^\\d+$")

module.exports.hasError = function () {
	if (this.errors) {
		this.status = 400
		this.body = this.errors
		return true
	} else {
		return false
	}
}
