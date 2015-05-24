require("mocha-cakes")
should = require("should")
app = require("./context/appContext")
request = app.request

Feature "Delete box",
	"As a user",
	"I want to delete a box in my mailbox",
	"So that a can organize my boxes", ->
		
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a delete box request", (done)->
				request.delete("/boxes/features+deleteBox").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401

		Scenario "Delete an existing box", ->
			result = null
			error = null
			box = null
			Given "An valid box name", ->
				box = "features+deleteBox+thisBoxExists"
			And "An authenticated user", (done)->
				app.login(done)
			And "An existant box", (done)->
				request.get("/boxes/" + box).end (err, res)->
					res.statusCode.should.be.exactly 200
					done()
			When "I send a delete box request", (done)->
				request.delete("/boxes/" + box)
				.end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the box should not exist anymore", (done)->
				request.get("/boxes/" + box).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()
					
		Scenario "Delete a non existing box", ->
			result = null
			error = null
			box = null
			Given "An valid box name", ->
				box = "features+deleteBox+thisBoxDoesNotExist"
			And "An authenticated user", (done)->
				app.login(done)
			And "A non existant box", (done)->
				request.get("/boxes/" + box).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()
			When "I send a delete box request", (done)->
				request.delete("/boxes/" + box)
				.end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404