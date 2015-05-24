"use strict"
let MODULE_NAME = "davManager"
let logger = require("log4js").getLogger(MODULE_NAME)
let conf = require("nconf")
let xml2js = require("xml2js")
var Q = require("q")
let davProtocol = conf.get("dav:protocol") || "http"
let davHost = conf.get("dav:host") || "localhost"
let davPort = conf.get("dav:port") || "80"
let davCardUrl = conf.get("dav:card:url") || "/carddav/%LOGIN/contacts"
let davAuthMethod = conf.get("dav:auth:method") || "BASIC"
let builder = new xml2js.Builder()
let parser = xml2js
let httpClient
if (davProtocol === "http") {
	httpClient = require("http")
} else {
	httpClient = require("https")
}

function getAuth (username, password) {
	if (davAuthMethod === "BASIC") {
		return "Basic " + new Buffer(username + ":" + password).toString("base64")
	} else {
		throw new Error("Unknown auth method. Only DIGEST or BASIC are supported")
	}
}

function sendHttpRequest (method, urn, requestContent, auth, headers, callback) {
	let options = {
		hostname: davHost,
		port: davPort,
		path: urn,
		method: method,
		headers: headers,
	}
	// Create the request
	logger.debug("Sending HTTP request to " + method + " " + davHost + ":" + davPort + urn)
	logger.debug("headers: " + JSON.stringify(headers))
	logger.debug("content: " + requestContent)
	if (!options.headers) {
		options.headers = {}
	}
	options.headers["User-Agent"] = "erizo-webmail-api"
	options.headers.Authorization = auth
	var req = httpClient.request(options, function (res) {
		logger.debug("Receiving HTTP response. Status: " + res.statusCode)
		let data = ""
		res.on("data", function (chunk) {
			logger.debug("Response data: " + chunk)
			data += chunk
		})
		res.on("end", function () {
			logger.debug("Dav response received")
			callback(null, data)
		})
	})
	req.on("error", function (e) {
		callback(e)
	})
	// Send the request
	req.write(requestContent)
	req.end()
}

function sendHttpRequestT (method, urn, requestContent, auth, headers) {
	return function (callback) {
		sendHttpRequest(method, urn, requestContent, auth, headers, callback)
	}
}

module.exports.sendDavRequest = function* (request, username, password) {
	logger.debug("Send DAV request: " + JSON.stringify(request))
	// Build the parameters
	let xmlRequest = builder.buildObject(request.content)
	let auth = getAuth(username, password)
	let headers = request.headers || {}
	headers["Content-Type"] = "application/xml"
	headers["Content-Length"] = Buffer.byteLength(xmlRequest, "utf8")
	// Apply rewrites
	request.urn = request.urn.replace("%LOGIN", username)
	// Send the request
	let result =
		yield sendHttpRequestT(request.method, request.urn, xmlRequest, auth, headers)
	// Parse the result
	logger.debug("Parse DAV request result")
	let parsedResult =
		yield Q.nfcall(parser.parseString, result)
	logger.debug("DAV request Result: " + JSON.stringify(parsedResult))
	return parsedResult
}

module.exports.getSearchContactRequestByFnOrEmail = function (criteria, limit) {
	let requestContent = {
		"C:addressbook-query": {
			"$": {
				"xmlns:D": "DAV:",
				"xmlns:C": "urn:ietf:params:xml:ns:carddav",
			},
			"D:prop": [{
				"C:address-data": [{
					"C:prop": [{
						"$": {
							"name": "EMAIL",
						},
					}, {
						"$": {
							"name": "FN",
						},
					},
					],
				},
				],
			},
			],
			"C:filter": [{
				"$": {
					"test": "anyof",
				},
				"C:prop-filter": [{
					"$": {
						"name": "FN",
					},
					"C:text-match": [{
						"_": criteria,
						"$": {
							"collation": "i;unicode-casemap",
							"match-type": "contains",
						},
					},
					],
				}, {
					"$": {
						"name": "EMAIL",
					},
					"C:text-match": [{
						"_": criteria,
						"$": {
							"collation": "i;unicode-casemap",
							"match-type": "contains",
						},
					},
					],
				},
				],
			},
			],
		},
	}
	if (limit) {
		requestContent["C:addressbook-query"]["C:limit"] = [{
			"C:nresults": [limit.toString()],
		},
		]
	}

	return {
		method: "REPORT",
		urn: davCardUrl,
		content: requestContent,
		headers: {
			Depth: 1,
		},
	}
}
module.exports.searchContactsByFnOrEmail = function* (criteria, username, password, limit) {
	logger.debug("Search contacts by name or email: " + criteria)
	let request = module.exports.getSearchContactRequestByFnOrEmail(criteria, limit)
	let response =
		yield module.exports.sendDavRequest(request, username, password)
	// Read the response elements
	if (!response["d:multistatus"]) {
		throw new Error("Unexpected dav response. The element d:multistatus is missing: \n" + JSON.stringify(response))
	}
	if (!response["d:multistatus"]["d:response"]) {
		logger.debug("No response element. Assuming no match")
		return []
	}

	logger.debug("Analyze search results")
	let vcards = []
	let responseElements = response["d:multistatus"]["d:response"]
	for (let i = 0; i < responseElements.length; i++) {
		let responseElement = responseElements[i]
		if (!responseElement["d:propstat"] || !responseElement["d:propstat"][0] || !responseElement["d:propstat"][0]["d:status"][0].contains("200")) {
			logger.warn("Invalid response element: " + JSON.stringify(responseElement))
		} else {
			let propStat = responseElement["d:propstat"][0]
			if (!propStat["d:prop"]) {
				logger.warn("Invalid propStat element: " + JSON.stringify(propStat))
			} else {
				let props = propStat["d:prop"]
				for (let j = 0; j < props.length; j++) {
					let prop = props[j]
					if (prop["card:address-data"]) {
						logger.debug("Address data found")
						vcards.push(prop["card:address-data"][0])
					} else {
						logger.debug("Skipping unknown property: " + JSON.stringify(prop))
					}
				}
			}
		}
	}

	logger.debug("Contacts matching [" + criteria + "]: " + JSON.stringify(vcards))
	return vcards
}
