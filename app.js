'use strict';
var MODULE_NAME = 'bootstrap';

require('log4js').configure('conf/log4js.json');
var logger = require('log4js').getLogger(MODULE_NAME);
var confLoader = require('./lib/confLoader');
var conf = require('nconf');
var http = require('./lib/http');
var app = require('./lib/app');


//Load the configuration
confLoader.load();

if (!module.parent) {
	http.createServer(app, conf.get('app:port') || 8080);
}