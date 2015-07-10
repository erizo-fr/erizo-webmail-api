require("mocha-cakes")
should = require("should")
app = require("./context/appContext")
request = app.request

Feature "Get message part",
	"As a user",
	"I want to get the message part of the messages in my mailbox",
	"So that a can read the contents", ->

		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a message request", (done)->
				request.get("/boxes/INBOX/messages/1/parts/1").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401

		Scenario "Get the part of a non existing message", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/INBOX/messages/999999/parts/1").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404

		Scenario "Get an existing part of a simple message", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/INBOX/messages/13/parts/1").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the part data", ->
				body = JSON.parse(result.text)
				body.content.should.be.exactly("World 2!")
				body.attributes.encoding.should.be.exactly("7BIT")
				body.attributes.partID.should.be.exactly("1")

		Scenario "Get an existing part of a multipart message", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/INBOX/messages/14/parts/2").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the part data", ->
				body = JSON.parse(result.text)
				body.content.should.be.exactly("<div>Coucou</div>")
				body.attributes.encoding.should.be.exactly("7BIT")
				body.attributes.partID.should.be.exactly("2")

		Scenario "Get an existing nested part of a multipart message", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/INBOX/messages/15/parts/1.2").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the part data", ->
				body = JSON.parse(result.text)
				body.content.should.be.exactly("<div>Coucou</div>")
				body.attributes.encoding.should.be.exactly("7BIT")
				body.attributes.partID.should.be.exactly("1.2")

		Scenario "Get an existing part with non ascii characters", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a message request", (done)->
				request.get("/boxes/INBOX/messages/17/parts/1").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the part data", ->
				body = JSON.parse(result.text)
				body.content.should.be.exactly("Accents: =C3=A0=C3=A8=C3=AB=C3=A4=C3=84=C3=B9%$!:\"'}{")
				body.attributes.partID.should.be.exactly("1")
