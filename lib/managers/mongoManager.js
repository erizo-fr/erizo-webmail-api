'use strict';
var MODULE_NAME = 'mongoManager';

var logger = require('log4js').getLogger(MODULE_NAME);
var conf = require('nconf');
var mongoose = require('mongoose');


//Connection
let url = conf.get('mongo:url') || 'mongodb://localhost/erizo-mail';
logger.debug('Connection to mongodb: ' + url);
mongoose.connect(url);


//Setup events  
mongoose.connection.on('connected', function () {
    logger.info('Connected to ' + url);
});
mongoose.connection.on('error', function (err) {
    logger.error(err);
});
mongoose.connection.on('disconnected', function () {
    logger.warn('Disconnected');
});
process.on('exit', function (code) {
    mongoose.connection.close(function () {
        logger.warn('Disconnected through app termination');
    });
});


//Initialize models
module.exports.models = {};


let userDataModel = mongoose.Schema({
    _id: String, //The id is the account login
    email: 'string',
    displayName: 'string',
    identities: [{
        displayName: 'string',
        email: 'string'
    }],
    preferences: {   
    }
});
module.exports.models.UserData = mongoose.model('userData', userDataModel);