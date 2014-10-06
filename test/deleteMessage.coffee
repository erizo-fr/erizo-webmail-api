require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
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
				request.delete('/boxes/features+deleteMessage/messages/42').end (err, res)->
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
			Given "An authenticated user", (done)->
				app.login(done)
			And "An existing message", (done) ->
				request.get('/boxes/features+deleteMessage/messages/2').end (err, res)->
					should.exist res
					should.not.exist err
					body = JSON.parse(res.text)
					should.exist body
					should.exist body.attrs
					should.exist body.attrs.uid
					body.attrs.uid.should.be.exactly 2
					done()
			When "I delete a message", (done)->
				request.delete('/boxes/features+deleteMessage/messages/2').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "The message should not exist any more", (done)->
				request.get('/boxes/features+deleteMessage/messages/2').end (err, res)->
					should.exist res
					should.not.exist err
					res.statusCode.should.be.exactly 404
					done()
			And "The other messages should still exist", (done)->
				request.get('/boxes/features+deleteMessage/messages/1').end (err, res)->
					should.exist res
					should.not.exist err
					body = JSON.parse(res.text)
					should.exist body
					should.exist body.attrs
					should.exist body.attrs.uid
					body.attrs.uid.should.be.exactly 1
					done()
