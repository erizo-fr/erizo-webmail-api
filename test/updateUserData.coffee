require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
request = app.request

Feature "Update user data",
	"As a user",
	"I want to update my user data",
	"So I can customize the application behavior", ->
	
	
		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I get my user data", (done)->
                request.put('/account/userdata').end (err, res)->
                    error = err
                    result = res
                    done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401
	
		Scenario "Update user data", ->
			result = null
			error = null
			accountData = {   
                email: 'usertest@test.com',
                displayName: 'User test'
            };
			
			Given "An authenticated user", (done)->
				app.login(done)
			When "I update my user data", (done)->
                request.put('/account/userdata')
                .send {data : accountData}
                .end (err, res)->
                    error = err
                    result = res
                    done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
                result.statusCode.should.be.exactly 200
            And "the user data should be updated", (done)->
                request.get('/account/userdata').end (err, res)->
                    if err
                        done err, res
                    else
                        res.statusCode.should.be.exactly 200
                        body = JSON.parse(res.text)
                        should.exist body
                        accountData.email.should.be.exactly body.email
                        accountData.displayName.should.be.exactly body.displayName
                        done()
