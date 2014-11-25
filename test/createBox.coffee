require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
request = app.request

Feature "Create box",
	"As a user",
	"I want to create a box in my mailbox",
	"So that a can store my mails into it", ->
		
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a create box request", (done)->
				request.post('/boxes').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401
				
		Scenario "Box creation with invalid param", ->
			result = null
			error = null
			box = null;
			Given "A valid box name", ->
				box = 'features+createBox+createBoxTestWithInvalidParams'
			And "An authenticated user", (done)->
				app.login(done)
			And "A non existant box", (done)->
				request.get('/boxes/' + box).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()
			When "I send a create box request", (done)->
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
			And "The box should not exist", (done)->
				request.get('/boxes/' + box).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()

		Scenario "Creation of a box witch exists already", ->
			result = null
			error = null
			box = null;
			Given "An valid box name", ->
				box = 'features+createBox+thisBoxExists'
			And "An authenticated user", (done)->
				app.login(done)
			And "An existant box", (done)->
				request.get('/boxes/' + box).end (err, res)->
					res.statusCode.should.be.exactly 200
					done()
			When "I send a create box request", (done)->
				body = {
					path: box
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
					
		Scenario "Basic box creation", ->
			result = null
			error = null
			box = null;
			Given "A valid box name", ->
				box = 'features+createBox+createBoxTestBasic'
			And "An authenticated user", (done)->
				app.login(done)
			And "A non existant box", (done)->
				request.get('/boxes/' + box).end (err, res)->
					res.statusCode.should.be.exactly 404
					done()
			When "I send a create box request", (done)->
				body = {
					path: box
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
			And "The box should exist now", (done)->
				request.get('/boxes/' + box).end (err, res)->
					res.statusCode.should.be.exactly 200
					done()