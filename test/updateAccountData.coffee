require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
request = app.request

Feature "Update Account data",
	"As a user",
	"I want to update my account data",
	"So I can customize the application behavior", ->
	
	
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I get my account data", (done)->
                request.put('/account/data').end (err, res)->
                    error = err
                    result = res
                    done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401
	
		Scenario "Update account data", ->
			result = null
			error = null
			messageId = null
			
			Given "An authenticated user", (done)->
				app.login(done)
			When "I update my account data", (done)->
                body = {
                    data: {
                        email: 'usertest@test.com',
                        displayName: 'User test'
                    }
                }
                request.put('/account/data')
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
            And "the account data should be updated", (done)->
                request.get('/account/data').end (err, res)->
                    if err
                        done err, res
                    else
                        res.statusCode.should.be.exactly 200
                        console.log res
                        should.exist TODO #Test result
                        done()
