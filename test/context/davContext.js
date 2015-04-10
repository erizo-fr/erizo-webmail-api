'use strict';
var MODULE_NAME = 'davContext';

require('log4js').configure('./test/conf/log4js.json');
var logger = require('log4js').getLogger(MODULE_NAME);
var nconf = require('nconf');

//TODO: Find a way to test Carddav