'use strict';
var MODULE_NAME = 'http';

var logger = require('log4js').getLogger(MODULE_NAME);
var http = require('http');

module.exports.createServer = function (app, port) {
	logger.debug('Create http server');
	var server = http.createServer(app.callback());

	server.listen(port, function() {
		logger.warn('HTTP server is now bound on ' + port);
	});

	return server;
};
