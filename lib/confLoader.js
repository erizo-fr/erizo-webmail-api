'use strict';
var MODULE_NAME = 'confLoader';

var logger = require('log4js').getLogger(MODULE_NAME);
var nconf = require('nconf');

//Initialization
module.exports.load = function () {
	logger.debug('Load configurations');
	nconf.env().argv();
    logger.debug('Load file: imap.json');
	nconf.file('imap', './conf/imap.json');
    logger.debug('Load file: smtp.json');
	nconf.file('smtp', './conf/smtp.json');
    logger.debug('Load file: app.json');
	nconf.file('app', './conf/app.json');
};