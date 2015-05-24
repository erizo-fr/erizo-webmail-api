require("mocha-cakes")
should = require("should")
app = require("./context/appContext")
request = app.request

Feature "Delete message",
	"As a user",
	"I want to delete a message",
	"So my mailbox won't be full", ->


		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a new message", (done)->
				request.delete("/boxes/features+deleteMessage/messages/42").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401




		Scenario "Delete a message by id", ->
			result = null
			error = null
			messageId = null

			Given "An authenticated user", (done)->
				app.login(done)
			And "An existing message", (done) ->
				request.get("/boxes/features+deleteMessage/messages/2?fetchEnvelope=true").end (err, res)->
					should.exist res
					should.not.exist err
					body = JSON.parse(res.text)
					body.attrs.uid.should.be.exactly 2
					messageId = body.attrs.envelope.messageId
					done()
			When "I delete a message", (done)->
				request.delete("/boxes/features+deleteMessage/messages/2?realDelete=true").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "The message should not exist any more", (done)->
				request.get("/boxes/features+deleteMessage/messages/2").end (err, res)->
					should.exist res
					should.not.exist err
					res.statusCode.should.be.exactly 404
					done()
			And "The message should not exist in the trash", (done)->
				request.get("/boxes/Trash").end (err, res)->
					should.exist res
					should.not.exist err
					res.statusCode.should.be.exactly 200
					box = JSON.parse res.text
					should.exist box.highestmodseq
					request.get("/boxes/Trash/messages/" + box.highestmodseq + "?fetchEnvelope=true").end (err, res)->
						should.exist res
						should.not.exist err
						if res.statusCode is 404
							done()
						else
							body = JSON.parse res.text
							body.attrs.envelope.messageId.should.not.be.exactly messageId
							done()
			And "The other messages should still exist", (done)->
				request.get("/boxes/features+deleteMessage/messages/1").end (err, res)->
					should.exist res
					should.not.exist err
					res.statusCode.should.be.exactly 200
					done()


		Scenario "Delete a non-existant message by id", ->
			result = null
			error = null
			messageId = null

			Given "An authenticated user", (done)->
				app.login(done)
			And "An non-existing message", (done) ->
				request.get("/boxes/features+deleteMessage/messages/999999").end (err, res)->
					should.exist res
					should.not.exist err
					res.statusCode.should.be.exactly 404
					done()
			When "I delete a message", (done)->
				request.delete("/boxes/features+deleteMessage/messages/999999?realDelete=true").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404



		Scenario "Move a message to trash by id", ->
			result = null
			error = null
			messageId = null

			Given "An authenticated user", (done)->
				app.login(done)
			And "An existing message", (done) ->
				request.get("/boxes/features+deleteMessage/messages/3?fetchEnvelope=true").end (err, res)->
					should.exist res
					should.not.exist err
					body = JSON.parse(res.text)
					body.attrs.uid.should.be.exactly 3
					messageId = body.attrs.envelope.messageId
					done()
			When "I delete a message", (done)->
				request.delete("/boxes/features+deleteMessage/messages/3").end (err, res)->
					error = err
					result = res
					done()

			Then "it should get a result", ->
				should.not.exist error
				should.exist result

			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200

			And "The message should not exist any more", (done)->
				request.get("/boxes/features+deleteMessage/messages/3").end (err, res)->
					should.exist res
					should.not.exist err
					res.statusCode.should.be.exactly 404
					done()

			And "The message should exist in the trash", (done)->
					request.get("/boxes/Trash").end (err, res)->
						should.exist res
						should.not.exist err
						res.statusCode.should.be.exactly 200
						box = JSON.parse res.text
						should.exist box.highestmodseq
						request.get("/boxes/Trash/messages/" + box.highestmodseq + "?fetchEnvelope=true").end (err, res)->
							should.exist res
							should.not.exist err
							body = JSON.parse res.text
							body.attrs.envelope.messageId.should.be.exactly messageId
							done()

			And "The other messages should still exist", (done)->
				request.get("/boxes/features+deleteMessage/messages/1").end (err, res)->
					should.exist res
					should.not.exist err
					res.statusCode.should.be.exactly 200
					done()
