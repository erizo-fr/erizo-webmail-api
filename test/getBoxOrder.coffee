require("mocha-cakes")
should = require("should")
app = require("./context/appContext")
request = app.request
	
Feature "Get box order",
	"As a user",
	"I want to get the order of the messages in the box",
	"So i can fetch the messages easily", ->
		
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a message request", (done)->
				request.get("/boxes/INBOX/order").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401
				
		Scenario "Get the message order on a non existant box", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a get message order request", (done)->
				request.get("/boxes/ThisBoxDoesNotExist/order").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404
				

		Scenario "Get the message order on a server without SORT capability", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a get message order request", (done)->
				request.get("/boxes/INBOX/order").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 501", ->
				result.statusCode.should.be.exactly 501