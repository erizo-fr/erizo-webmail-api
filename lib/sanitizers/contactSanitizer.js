'use strict';
var MODULE_NAME = 'ContactSanitizer';

var logger = require('log4js').getLogger(MODULE_NAME);
var sanitizerHelper = require('./sanitizerHelper');


module.exports.searchContacts = function * (next) {
    this.checkQuery('criteria').notEmpty();
    this.checkQuery('limit').optional().default('10').isInt().toInt().gt(0);

    if (!sanitizerHelper.hasError.call(this)) {
        yield next;
    }
};