'use strict';
var MODULE_NAME = 'sanitizerHelper';

var logger = require('log4js').getLogger(MODULE_NAME);


module.exports.PATTERN_BODIES = new RegExp('^.*$'); //TODO
module.exports.PATTERN_USERNAME = new RegExp('^.*$'); //TODO
module.exports.PATTERN_PASSWORD = new RegExp('^.*$'); //TODO
module.exports.PATTERN_BOX = new RegExp('^.*$'); //TODO
module.exports.PATTERN_IDS = new RegExp('^(\\d+(:\\d+)?)(,(\\d+(:\\d+)?))*$');
module.exports.PATTERN_ID = new RegExp('^\\d+$');