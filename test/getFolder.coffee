require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
request = app.request

Feature "Get folder",
	"As a user",
	"I want to get the folder data in my mailbox",
	"So that a can use it to fetch my mails", ->
		
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			folder = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a folder request", (done)->
				request.get('/boxes/INBOX').end (err, res)->
					error = err;
					result = res;
					done();
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401

		Scenario "Get an existing folder", ->
			result = null
			error = null
			folder = null
			Given "An valid folder", ->
				folder = 'CustomFolderWithChild'
			And "An authenticated user", (done)->
				app.login(done)
			When "I send a folder request", (done)->
				request.get('/boxes/' + folder).end (err, res)->
					error = err
					result = res
					done();
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the folder data", ->
				body = JSON.parse(result.text);
				should.exist body
				should.exist body.name
				body.name.should.be.type('string')
				body.name.should.be.exactly('CustomFolderWithChild')
				
		Scenario "Get an non-existing folder", ->
			result = null
			error = null
			folder = null
			Given "An valid folder", ->
				folder = 'CustomFolderWithChild'
			And "An authenticated user", (done)->
				app.login(done)
			When "I send a folder request", (done)->
				request.get('/boxes/thisIsAnNonExistantFolder').end (err, res)->
					error = err
					result = res
					done();
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404

		Scenario "Get a folder that does not exist", ->
			result = null
			error = null
			folder = null
			Given "An invalid folder", ->
				folder = 'anInvalidFolder'
			And "An authenticated user", (done)->
				app.login(done)
			When "I send a folder request", (done)->
				request.get('/boxes/' + folder).end (err, res)->
					error = err
					result = res
					done();
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404
				