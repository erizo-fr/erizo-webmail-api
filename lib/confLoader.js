'use strict';
var MODULE_NAME = 'confLoader';

var logger = require('log4js').getLogger(MODULE_NAME);
var nconf = require('nconf');

//Initialization
module.exports.load = function () {
	logger.debug('Load configurations');
	nconf.env().argv();
	nconf.file('imap', './conf/imap.json');
	nconf.file('smtp', './conf/smtp.json');
	nconf.file('app', './conf/app.json');
};