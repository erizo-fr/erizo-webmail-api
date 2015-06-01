require("mocha-cakes")
should = require("should")
app = require("./context/appContext")
request = app.request

Feature "Move message",
	"As a user",
	"I want to be able to move my messages",
	"So that I can organize my messages", ->

		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a move message request", (done)->
				request.patch("/boxes/features+moveMessage+src/messages/1").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401

		Scenario "Try to move a non existing message", ->
			result = null
			error = null
			box = null
			messageUrl = "/boxes/features+moveMessage+src/messages/9999999"
			Given "An authenticated user", (done)->
				app.login(done)
			And "An non existing message", (done)->
				request.get(messageUrl).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()
			When "I send a move message request", (done)->
				body = {}
				request.patch(messageUrl)
				.send body
				.end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404

		Scenario "Try to move a message to a non existing box", ->
			result = null
			error = null
			box = null
			messageUrl = "/boxes/features+moveMessage+src/messages/2"
			Given "An authenticated user", (done)->
				app.login(done)
			And "An existing message", (done)->
				request.get(messageUrl).end (err, res)->
					res.statusCode.should.be.exactly 200
					done()
			When "I send a move message request", (done)->
				body = {
					"boxPath": "features+moveMessage+NonExistingBox",
				}
				request.patch(messageUrl)
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

		Scenario "Move a message to another box", ->
			result = null
			error = null
			box = null
			messageUrl = "/boxes/features+moveMessage+src/messages/1"
			Given "An authenticated user", (done)->
				app.login(done)
			And "An existing message", (done)->
				request.get(messageUrl).end (err, res)->
					res.statusCode.should.be.exactly 200
					done()
			When "I send a move message request", (done)->
				body = {
					"boxPath": "features+moveMessage+dst",
				}
				request.patch(messageUrl)
				.send body
				.end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 400", ->
				result.statusCode.should.be.exactly 200
			And "The message should not be in the source box anymore", (done)->
				request.get(messageUrl).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()
			And "The message should be in the destination box", (done)->
				dstBoxUrl = "/boxes/features+moveMessage+dst"
				request.get(dstBoxUrl).end (err, res)->
					if err
						done err, res
					else
						res.statusCode.should.be.exactly 200
						box = JSON.parse res.text
						should.exist box.highestmodseq
						request.get(dstBoxUrl + "/messages?fetchEnvelope=true&seqs=" + box.highestmodseq).end (err, res)->
							should.not.exist err
							messageInDst = JSON.parse res.text
							should.exist messageInDst
							messageInDst.should.be.instanceof Array
							messageInDst.should.have.lengthOf 1
							messageAttrs = messageInDst[0].attrs
							messageAttrs.modseq.should.be.exactly box.highestmodseq
							messageAttrs.envelope.subject.should.be.exactly "Move a message to another box"
							done()
