require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
request = app.request

Feature "Create folder",
	"As a user",
	"I want to create a folder in my mailbox",
	"So that a can store my mails into it", ->
		
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a create folder request", (done)->
				request.post('/boxes').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401
				
		Scenario "Folder creation with invalid param", ->
			result = null
			error = null
			folder = null;
			Given "A valid folder name", ->
				folder = 'features+createFolder+createFolderTestWithInvalidParams'
			And "An authenticated user", (done)->
				app.login(done)
			And "A non existant folder", (done)->
				request.get('/boxes/' + folder).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()
			When "I send a create folder request", (done)->
				body = {}
				request.post('/boxes')
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
			And "The folder should not exist", (done)->
				request.get('/boxes/' + folder).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()

		Scenario "Creation of a folder witch exists already", ->
			result = null
			error = null
			folder = null;
			Given "An valid folder name", ->
				folder = 'features+createFolder+thisFolderExists'
			And "An authenticated user", (done)->
				app.login(done)
			And "An existant folder", (done)->
				request.get('/boxes/' + folder).end (err, res)->
					res.statusCode.should.not.be.exactly 404
					done()
			When "I send a create folder request", (done)->
				body = {
					path: folder
				}
				request.post('/boxes')
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
					
		Scenario "Basic folder creation", ->
			result = null
			error = null
			folder = null;
			Given "A valid folder name", ->
				folder = 'features+createFolder+createFolderTestBasic'
			And "An authenticated user", (done)->
				app.login(done)
			And "A non existant folder", (done)->
				request.get('/boxes/' + folder).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()
			When "I send a create folder request", (done)->
				body = {
					path: folder
				}
				request.post('/boxes')
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
			And "The folder should exist now", (done)->
				request.get('/boxes/' + folder).end (err, res)->
					res.statusCode.should.be.exactly 200
					done()