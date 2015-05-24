require("mocha-cakes")
should = require("should")
app = require("./context/appContext")
request = app.request

Feature "Patch box",
	"As a user",
	"I want to path a box in my mailbox",
	"So that a organize my folders", ->
		
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a patch box request", (done)->
				request.patch("/boxes/features+patchBox").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401
				
		Scenario "Patch a non existing box", ->
			result = null
			error = null
			box = null
			Given "A valid box name", ->
				box = "features+patchBox+nonExistingBox"
			And "An authenticated user", (done)->
				app.login(done)
			And "An non existing box", (done)->
				request.get("/boxes/" + box).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()
			When "I send a patch box request", (done)->
				body = {}
				request.patch("/boxes/" + box)
				.send body
				.end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 400", ->
				result.statusCode.should.be.exactly 400
				
		Scenario "Box patch with invalid param", ->
			result = null
			error = null
			box = null
			Given "A valid box name", ->
				box = "features+patchBox+scenarioInvalidParam"
			And "An authenticated user", (done)->
				app.login(done)
			And "An existing box", (done)->
				request.get("/boxes/" + box).end (err, res)->
					res.statusCode.should.be.exactly 200
					done()
			When "I send a patch box request", (done)->
				body = {}
				request.patch("/boxes/" + box)
				.send body
				.end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 400", ->
				result.statusCode.should.be.exactly 400

		Scenario "Path changed", ->
			result = null
			error = null
			box = null
			newPath = null
			Given "An valid box name", ->
				box = "features+patchBox+scenarioPathChange"
				newPath = "features+patchBox+scenarioPathChangeRenamed"
			And "An authenticated user", (done)->
				app.login(done)
			And "An existing box", (done)->
				request.get("/boxes/" + box).end (err, res)->
					res.statusCode.should.be.exactly 200
					done()
			When "I send a patch box request", (done)->
				body = {
					path: newPath
				}
				request.patch("/boxes/" + box)
				.send body
				.end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the old box name should not exist anymore", (done)->
				request.get("/boxes/" + box).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()
			And "the new box name should exist", (done)->
				request.get("/boxes/" + newPath).end (err, res)->
					res.statusCode.should.be.exactly 200
					done()