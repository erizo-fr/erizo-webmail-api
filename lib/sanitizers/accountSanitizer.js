'use strict';
var MODULE_NAME = 'AccountSanitizer';

var logger = require('log4js').getLogger(MODULE_NAME);
var sanitizerHelper = require('./sanitizerHelper');


module.exports.getUserData = function * (next) {
    yield next;
};


module.exports.getUserPreferences = function * (next) {
    yield next;
};

module.exports.updateUserPreferences = function * (next) {
    this.checkBody('data').notEmpty();

    if (!sanitizerHelper.hasError.call(this)) {
        yield next;
    }
};