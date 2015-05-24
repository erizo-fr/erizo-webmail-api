require("mocha-cakes")
should = require("should")
app = require("./context/appContext")
request = app.request

Feature "Get box",
	"As a user",
	"I want to get the box data in my mailbox",
	"So that a can use it to fetch my mails", ->
		
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			box = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a box request", (done)->
				request.get("/boxes/INBOX").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401

		Scenario "Get an existing box", ->
			result = null
			error = null
			box = null
			Given "An valid box", ->
				box = "CustomFolderWithChild"
			And "An authenticated user", (done)->
				app.login(done)
			When "I send a box request", (done)->
				request.get("/boxes/" + box).end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the box data", ->
				body = JSON.parse(result.text)
				should.exist body
				should.exist body.name
				body.name.should.be.type("string")
				body.name.should.be.exactly("CustomFolderWithChild")
				
		Scenario "Get an non-existing box", ->
			result = null
			error = null
			box = null
			Given "An valid box", ->
				box = "CustomFolderWithChild"
			And "An authenticated user", (done)->
				app.login(done)
			When "I send a box request", (done)->
				request.get("/boxes/thisIsAnNonExistantFolder").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404

		Scenario "Get a box that does not exist", ->
			result = null
			error = null
			box = null
			Given "An invalid box", ->
				box = "anInvalidFolder"
			And "An authenticated user", (done)->
				app.login(done)
			When "I send a box request", (done)->
				request.get("/boxes/" + box).end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404
				