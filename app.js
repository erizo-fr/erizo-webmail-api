'use strict';
var MODULE_NAME = 'bootstrap';

require('log4js').configure('conf/log4js.json');
var logger = require('log4js').getLogger(MODULE_NAME);
require('./lib/confLoader').load();
var conf = require('nconf');
var http = require('./lib/http');
var app = require('./lib/app');

//Start listening
if (!module.parent) {
    process.on('SIGINT', function () {
        logger.warn('SIGINT received');
        process.exit(0);
    });
    process.on('SIGBREAK', function () {
        logger.warn('SIGBREAK received');
        process.exit(0);
    });
    process.on('exit', function (code) {
        logger.warn('Process terminating');
        process.exit(0);
    });

    http.createServer(app, conf.get('app:port') || 8080);
}