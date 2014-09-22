require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
request = app.request
	
Feature "Get messages",
	"As a user",
	"I want to get the messages in my mailbox",
	"So that a can read them", ->
		
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?ids=1').end (err, res)->
					error = err
					result = res
					done();
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401

		Scenario "Get a single message by uid", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?ids=1').end (err, res)->
					error = err
					result = res
					done();
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message list", ->
				body = JSON.parse(result.text)
				console.log('TODO');
				