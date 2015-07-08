require("mocha-cakes")
should = require("should")
app = require("./context/appContext")
request = app.request

Feature "Get message part content",
	"As a user",
	"I want to get the message part content of the messages in my mailbox",
	"So that a can download the attachments", ->

		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a request", (done)->
				request.get("/boxes/INBOX/messages/16/parts/1.1/content").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401

		Scenario "Get the content of a non existing message", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a request", (done)->
				request.get("/boxes/INBOX/messages/999999/parts/1").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404

		Scenario "Get an existing part content", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a request", (done)->
				request.get("/boxes/INBOX/messages/16/parts/2/content").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the part content", ->
				result.text.should.be.exactly("TODO")
			And "the response have the right content type", ->
				result.header["content-type"].should.be.startWith("text/plain")
			And "the response have the right content disposition", ->
				result.header["content-disposition"].should.be.exactly("attachment; filename=\"myAttachment.txt\"")
