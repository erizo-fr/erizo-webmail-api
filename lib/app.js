'use strict';
var MODULE_NAME = 'app';

var logger = require('log4js').getLogger(MODULE_NAME);
var koa = require('koa');
var koaLogger = require('koa-logger');
var koaRouter = require('koa-router');
var koaValidate = require('koa-validate');
var koaCompress = require('koa-compress');
var koaBodyParser = require('koa-bodyparser');
var koaSession = require('koa-generic-session');
var imapManager = require('./imapManager');
var smtpManager = require('./smtpManager');
var authController = require('./controllers/authController');
var boxController = require('./controllers/boxController');
var messageController = require('./controllers/messageController');



logger.debug('Create Koa app');
var app = module.exports = koa();

//Logger
app.use(koaLogger());

//Session
app.keys = ['keys', 'keykeys'];
app.use(koaSession());

//Body parser
app.use(koaBodyParser());

//Field validation
app.use(koaValidate());

//Router
app.use(koaRouter(app));
app.post('/login', authController.login);
app.post('/logout', authController.login);
app.get('/boxes', authController.authRequired, boxController.getBoxes);
app.get('/boxes/:box', authController.authRequired, boxController.getBox);
app.get('/boxes/:box/messages', authController.authRequired, messageController.getMessages);
app.post('/messages', authController.authRequired, messageController.postMessage);

//Compress
app.use(koaCompress());