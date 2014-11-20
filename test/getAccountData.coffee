require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
request = app.request

Feature "Get Account data",
	"As a user",
	"I want to get my account data",
	"So I can customize the application behavior", ->
	
	
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I get my account data", (done)->
				request.get('/account/data').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401
	
		Scenario "Get account data", ->
			result = null
			error = null
			messageId = null
			
			Given "An authenticated user", (done)->
				app.login(done)
			When "I get my account data", (done)->
				request.get('/account/data').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
                result.statusCode.should.be.exactly 200
                console.log result
			