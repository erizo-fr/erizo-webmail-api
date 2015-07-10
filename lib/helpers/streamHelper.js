"use strict"
let MODULE_NAME = "streamHelper"
let logger = require("log4js").getLogger(MODULE_NAME)

module.exports.streamToBuffer = function * (stream, id) {
	return yield function (callback) {
		let buffer = new Buffer([])
		stream.on("data", function (chunk) {
			buffer = Buffer.concat([buffer, chunk])
			logger.debug("Stream#" + id + " data received: " + chunk.length)
		})
		stream.once("end", function () {
			logger.debug("Stream#" + id + " ended: " + buffer.length)
			callback(null, buffer)
		})
		stream.on("error", callback)
	}
}

module.exports.streamArrayToBuffer = function * (streamArray, id) {
	let result = []
	for (let i = 0; i < streamArray.length; i++) {
		result[i] = yield module.exports.streamToBuffer(streamArray[i], id + "[" + i + "]")
	}
	return result
}

module.exports.objectAttributesStreamsToBuffer = function * (object, id) {
	let result = {}
	for (let propertyName in object) {
		result[propertyName] = yield module.exports.streamToBuffer(object[propertyName], id + "[" + propertyName + "]")
	}
	return result
}

module.exports.streamToString = function * (stream, id) {
	let buffer = yield module.exports.streamToBuffer(stream, id)
	return buffer.toString()
}

module.exports.streamArrayToString = function * (streamArray, id) {
	let result = []
	for (let i = 0; i < streamArray.length; i++) {
		result[i] = yield module.exports.streamToString(streamArray[i], id + "[" + i + "]")
	}
	return result
}

module.exports.objectAttributesStreamsToString = function * (object, id) {
	let result = {}
	for (let propertyName in object) {
		result[propertyName] = yield module.exports.streamToString(object[propertyName], id + "[" + propertyName + "]")
	}
	return result
}
