'use strict';

var MODULE_NAME = 'smtpManager';
var logger = require('log4js').getLogger(MODULE_NAME);
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var SMTP_OPTION_NAME = 'erizo.fr';
var SMTP_OPTION_HOST = 'smtp.erizo.fr';
var SMTP_OPTION_PORT = 465;
var SMTP_OPTION_SECURE = true;
var SMTP_OPTION_IGNORE_TLS = true;
var SMTP_OPTION_AUTH_METHOD = 'PLAIN';
var SMTP_OPTION_DEBUG = true;



// Public functions ///////////////////////////////////////

module.exports.setOptions = function (options) {
	SMTP_OPTION_NAME = options.name;
	SMTP_OPTION_HOST = options.host;
	SMTP_OPTION_PORT = options.port;
	SMTP_OPTION_SECURE = options.secure;
	SMTP_OPTION_IGNORE_TLS = options.ignoreTLS;
	SMTP_OPTION_AUTH_METHOD = options.authMethod;
};


module.exports.getConnection = function (username, password) {
	let options = {
		port: SMTP_OPTION_PORT,
		host: SMTP_OPTION_HOST,
		secure: SMTP_OPTION_SECURE,
		auth: {
			user: username,
			pass: password
		},
		ignoreTLS: SMTP_OPTION_IGNORE_TLS,
		name: SMTP_OPTION_NAME,
		debug: SMTP_OPTION_DEBUG,
		authMethod: SMTP_OPTION_AUTH_METHOD

	};

	logger.debug('Create SMTP connection for username#' + username);
	return nodemailer.createTransport(smtpTransport(options));
};