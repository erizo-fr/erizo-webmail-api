"use strict"
var MODULE_NAME = "app"
var logger = require("log4js").getLogger(MODULE_NAME)
var koa = require("koa")
var koaLogger = require("koa-log4js")
var koaRouter = require("koa-router")
var koaValidate = require("koa-validate")
var koaCompress = require("koa-compress")
var koaBodyParser = require("koa-body")
var koaSession = require("koa-generic-session")
var accountController = require("./controllers/accountController")
var accountSanitizer = require("./sanitizers/accountSanitizer")
var authController = require("./controllers/authController")
var authSanitizer = require("./sanitizers/authSanitizer")
var boxController = require("./controllers/boxController")
var boxSanitizer = require("./sanitizers/boxSanitizer")
var messageController = require("./controllers/messageController")
var messageSanitizer = require("./sanitizers/messageSanitizer")
var contactSanitizer = require("./sanitizers/contactSanitizer")
var contactController = require("./controllers/contactController")
var contactService = require("./services/contactService")

logger.debug("Create Koa app")

var app = module.exports = koa()

// Logger
app.use(koaLogger())

// Session
app.keys = ["keys", "keykeys"]
app.use(koaSession())

// Body parser
app.use(koaBodyParser())

// Field validation
app.use(koaValidate())

// Compress
app.use(koaCompress())

// Router
app.use(koaRouter(app))

app.post("/login", authSanitizer.login, authController.login)
app.post("/logout", authSanitizer.logout, authController.logout)
app.get("/boxes", authController.authRequired, boxSanitizer.getBoxes, boxController.getBoxes)
app.post("/boxes", authController.authRequired, boxSanitizer.createBox, boxController.createBox)
app.get("/boxes/:box", authController.authRequired, boxSanitizer.getBox, boxController.getBox)
app.patch("/boxes/:box", authController.authRequired, boxSanitizer.patchBox, boxController.patchBox)
app.delete("/boxes/:box", authController.authRequired, boxSanitizer.deleteBox, boxController.deleteBox)
app.get("/boxes/:box/order", authController.authRequired, boxSanitizer.getBoxOrder, boxController.getBoxOrder)
app.get("/boxes/:box/messages", authController.authRequired, messageSanitizer.getMessages, messageController.getMessages)
app.get("/boxes/:box/messages/:id", authController.authRequired, messageSanitizer.getMessage, messageController.getMessage)
app.delete("/boxes/:box/messages/:id", authController.authRequired, messageSanitizer.deleteMessage, messageController.deleteMessage)
app.post("/messages", authController.authRequired, messageSanitizer.postMessage, messageController.postMessage)
app.get("/contacts", authController.authRequired, contactSanitizer.searchContacts, contactController.searchContacts, contactService.searchContacts)
app.get("/account/data", authController.authRequired, accountSanitizer.getUserData, accountController.getUserData)
app.get("/account/preferences", authController.authRequired, accountSanitizer.getUserPreferences, accountController.getUserPreferences)
app.put("/account/preferences", authController.authRequired, accountSanitizer.updateUserPreferences, accountController.updateUserPreferences)
