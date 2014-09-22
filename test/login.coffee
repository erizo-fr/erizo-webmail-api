require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
request = app.request

sendLogin = (username, password, callback) ->
	body = {}
	if username != null then body.username = username
	if password != null then body.password = password
	request.post('/login')
	.send body
	.end callback

Feature "Login",
	"As a user",
	"I want to log into the application",
	"So that I can use it", ->

		Scenario "Valid login request", ->
			result = null
			error = null
			username = null
			password = null
				
			Given "A valid user", ->
				username = 'testuser'
				password = 'testpass'
			When "I send a login request", (done)->
				sendLogin username, password, (err, res) ->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
				
		Scenario "Invalid login request", ->
			result = null
			error = null
			username = null
			password = null
				
			Given "An invalid user", ->
				username = 'invalidUser'
				password = 'invalidPassword'
			When "I send a login request", (done)->
				sendLogin username, password, (err, res) ->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401
				
		Scenario "Missing login argument", ->
			result = null
			error = null
			username = null
			password = null
				
			Given "A user without login", ->
				password = 'password'
			When "I send a login request", (done)->
				sendLogin username, password, (err, res) ->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 400", ->
				result.statusCode.should.be.exactly 400
				
		Scenario "Missing password argument", ->
			result = null
			error = null
			username = null
			password = null
				
			Given "A user without password", ->
				username = 'username'
			When "I send a login request", (done)->
				sendLogin username, password, (err, res) ->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 400", ->
				result.statusCode.should.be.exactly 400
				