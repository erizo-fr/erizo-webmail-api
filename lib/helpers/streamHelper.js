"use strict"
let MODULE_NAME = "streamHelper"
let logger = require("log4js").getLogger(MODULE_NAME)
let base64Stream = require("base64-stream")
let quotedPrintable = require("quoted-printable")
let stream = require("stream")

module.exports.streamToBuffer = function * (streamObj, id) {
	return yield function (callback) {
		let buffer = new Buffer([])
		streamObj.on("data", function (chunk) {
			buffer = Buffer.concat([buffer, chunk])
			logger.debug("Stream#" + id + " data received: " + chunk.length)
		})
		streamObj.once("end", function () {
			logger.debug("Stream#" + id + " ended: " + buffer.length)
			callback(null, buffer)
		})
		streamObj.on("error", callback)
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

module.exports.streamToString = function * (streamObj, id) {
	let buffer = yield module.exports.streamToBuffer(streamObj, id)
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

module.exports.getStreamDecoder = function (encoding) {
	// Switch encoding to lower case
	encoding = encoding.toLowerCase()

	if (encoding === "base64") {
		return module.exports.getStreamDecoderBase64()
	} else if (encoding === "quoted-printable") {
		return module.exports.getStreamDecoderQuotedPrintable()
	} else {
		logger.warn("Unsupported stream encoding (" + encoding + "). Assuming no transformation is needed")
		return module.exports.getStreamDecoderNoEncoding()
	}
}

module.exports.getStreamDecoderNoEncoding = function () {
	let liner = new stream.Transform({objectMode: true})
	liner._transform = function (chunk, chunkEncoding, done) {
		this.push(chunk)
		done()
	}
	return liner
}

module.exports.getStreamDecoderBase64 = function () {
	return base64Stream.decode()
}

module.exports.getStreamDecoderQuotedPrintable = function () {
	let liner = new stream.Transform({objectMode: true})
	liner._transform = function (chunk, chunkEncoding, done) {
		let decodedChunk = quotedPrintable.decode(chunk.toString())
		this.push(new Buffer(decodedChunk))
		done()
	}
	return liner
}

