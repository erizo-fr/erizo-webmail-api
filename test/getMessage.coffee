require("mocha-cakes")
should = require("should")
app = require("./context/appContext")
request = app.request

Feature "Get message",
	"As a user",
	"I want to get the message in my mailbox by uid",
	"So that a can read it", ->

		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a message request", (done)->
				request.get("/boxes/INBOX/messages/1").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401

		Scenario "Get a single message by uid", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/INBOX/messages/13").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message", ->
				body = JSON.parse(result.text)
				body.attrs.uid.should.be.exactly 13

		Scenario "Get a single message with structure", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/features+getMessage/messages/3?fetchStruct=true").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message", ->
				body = JSON.parse(result.text)
				body.attrs.struct[0].partID.should.be.exactly "1"

		Scenario "Get a single message without structure", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/features+getMessage/messages/3").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message", ->
				body = JSON.parse(result.text)
				should.not.exist body.attrs.struct

		Scenario "Get a single message with envelope", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/features+getMessage/messages/3?fetchEnvelope=true").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message", ->
				body = JSON.parse(result.text)
				body.attrs.envelope.subject.should.be.exactly "Yo subject"

		Scenario "Get a single message without envelope", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/features+getMessage/messages/3").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message", ->
				body = JSON.parse(result.text)
				should.not.exist body.attrs.envelope

		Scenario "Get a non existing message by uid", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/INBOX/messages/999999").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404

		Scenario "Fetch a message and mark it as seen", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			And "An unseen message", (done) ->
				request.get("/boxes/features+getMessage/messages/1?markSeen=false").end (err, res)->
					body = JSON.parse(res.text)
					body.attrs.flags.should.not.containEql "\\Seen"
					request.get("/boxes/features+getMessage/messages/1?markSeen=false").end (err, res)->
						body = JSON.parse(res.text)
						body.attrs.flags.should.not.containEql "\\Seen"
						done()
			When "I send a message request", (done)->
				request.get("/boxes/features+getMessage/messages/1?markSeen=true").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should be marked as seen", (done) ->
				body = JSON.parse(result.text)
				body.attrs.flags.should.containEql "\\Seen"
				done()

		Scenario "Fetch a message without marking it as seen", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			And "An unseen message", (done) ->
				request.get("/boxes/features+getMessage/messages/2?markSeen=false").end (err, res)->
					body = JSON.parse(res.text)
					body.attrs.flags.should.not.containEql "\\Seen"
					done()
			When "I send a message request", (done)->
				request.get("/boxes/features+getMessage/messages/2?markSeen=false").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should be marked as seen", (done) ->
				body = JSON.parse(result.text)
				body.attrs.flags.should.not.containEql "\\Seen"
				done()
