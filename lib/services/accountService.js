'use strict';
var MODULE_NAME = 'AccountService';

var logger = require('log4js').getLogger(MODULE_NAME);
var mongoManager = require('../managers/mongoManager');
var Q = require ('q');

module.exports.getUserData = function * (username) {
    logger.debug('Getting userdata of user#' + username);

    //Prepare the query
    let query = mongoManager.models.UserData.find({
        _id: username
    }).lean();
    
    //Execute the query
    let userData = yield Q.nfcall(query.exec);
    logger.debug('Userdata of user#' + username + ': ' + userData);
    
    return userData;
};

module.exports.updateUserData = function * (username, userDataObject) {
    delete userDataObject._id;
    logger.debug('Update userdata of user#' + username + ' with ' + userDataObject);

    
    //Create or replace the saved data
    let query = mongoManager.models.UserData.update({
        _id: username
    }, userDataObject, {
        upsert: true
    });
    
    yield Q.nfcall(query.exec);
};