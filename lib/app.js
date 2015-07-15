"use strict"
var MODULE_NAME = "app"
var logger = require("log4js").getLogger(MODULE_NAME)
var conf = require("nconf")
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
app.use(koaBodyParser({
	formLimit: "50mb",
	jsonLimit: "50mb",
}))

// Field validation
app.use(koaValidate())

// Compress
app.use(koaCompress())

// Router
let router = koaRouter({
	prefix: conf.get("app:rootUrl") || "",
})
router.post("/login", authSanitizer.login, authController.login)
router.post("/logout", authSanitizer.logout, authController.logout)
router.get("/boxes", authController.authRequired, boxSanitizer.getBoxes, boxController.getBoxes)
router.post("/boxes", authController.authRequired, boxSanitizer.createBox, boxController.createBox)
router.get("/boxes/:box", authController.authRequired, boxSanitizer.getBox, boxController.getBox)
router.patch("/boxes/:box", authController.authRequired, boxSanitizer.patchBox, boxController.patchBox)
router.delete("/boxes/:box", authController.authRequired, boxSanitizer.deleteBox, boxController.deleteBox)
router.get("/boxes/:box/order", authController.authRequired, boxSanitizer.getBoxOrder, boxController.getBoxOrder)
router.get("/boxes/:box/messages", authController.authRequired, messageSanitizer.getMessages, messageController.getMessages)
router.get("/boxes/:box/messages/:id", authController.authRequired, messageSanitizer.getMessage, messageController.getMessage)
router.get("/boxes/:box/messages/:id/parts/:partId", authController.authRequired, messageSanitizer.getMessagePart, messageController.getMessagePart)
router.get("/boxes/:box/messages/:id/parts/:partId/content", authController.authRequired, messageSanitizer.getMessagePartContent, messageController.getMessagePartContent)
router.patch("/boxes/:box/messages/:id", authController.authRequired, messageSanitizer.patchMessage, messageController.patchMessage)
router.delete("/boxes/:box/messages/:id", authController.authRequired, messageSanitizer.deleteMessage, messageController.deleteMessage)
router.post("/messages", authController.authRequired, messageSanitizer.postMessage, messageController.postMessage)
router.get("/contacts", authController.authRequired, contactSanitizer.searchContacts, contactController.searchContacts, contactService.searchContacts)
router.get("/account/data", authController.authRequired, accountSanitizer.getUserData, accountController.getUserData)
router.get("/account/preferences", authController.authRequired, accountSanitizer.getUserPreferences, accountController.getUserPreferences)
router.put("/account/preferences", authController.authRequired, accountSanitizer.updateUserPreferences, accountController.updateUserPreferences)
app.use(router.routes())
