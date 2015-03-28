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
					done()
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
				request.get('/boxes/INBOX/messages?ids=13').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message list", ->
				body = JSON.parse(result.text)
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 1
				body[0].attrs.uid.should.be.exactly 13
				
		Scenario "Get several messages by uid", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?ids=12&ids=13').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message list", ->
				body = JSON.parse(result.text)
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 2
				body[0].attrs.uid.should.be.exactly 12
				body[1].attrs.uid.should.be.exactly 13
				
		Scenario "Search a non existant message by uid", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?ids=99999999').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains an empty message list", ->
				body = JSON.parse(result.text)
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 0
				
		Scenario "Get a single message by uid", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages/13').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message", ->
				body = JSON.parse(result.text)
				body.attrs.uid.should.be.exactly 13
				
		Scenario "Get a non existing message by uid", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages/999999').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404
				
		Scenario "Get a single message by seq", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=1').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message list", ->
				body = JSON.parse(result.text)
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 1
				body[0].attrs.modseq.should.be.exactly '1'
				
		Scenario "Get several messages by seqs", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=1&seqs=2').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message list", ->
				body = JSON.parse(result.text)
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 2
				body[0].attrs.modseq.should.be.exactly '1'
				body[1].attrs.modseq.should.be.exactly '2'
				
		Scenario "Search a non existant message by seq", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=99999999').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains an empty message list", ->
				body = JSON.parse(result.text)
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 0
				
		Scenario "Send a request with both ids and seqs", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=1&ids=1').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 400", ->
				result.statusCode.should.be.exactly 400
			And "the response should contains an error message", ->
				should.exist result.res.text
				result.res.text.should.be.exactly 'Exactly one of ids or seqs param must be given'
				
		Scenario "Send a request without ids nor seqs", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 400", ->
				result.statusCode.should.be.exactly 400
			And "the response should contains an error message", ->
				should.exist result.res.text
				result.res.text.should.be.exactly 'Exactly one of ids or seqs param must be given'
				
		Scenario "Get a single message with structure", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=1&fetchStruct=true').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message structure", ->
				body = JSON.parse(result.text)
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 1
				body[0].attrs.struct.should.be.instanceof Array
				body[0].attrs.struct.length.should.be.above 0
				
		Scenario "Get a single message without structure", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=1&fetchStruct=false').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should not contains the message structure", ->
				body = JSON.parse(result.text)
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 1
				should.not.exist body[0].attrs.struct
				
		Scenario "Get a single message with envelope", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=1&fetchEnvelope=true').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message envelope", ->
				body = JSON.parse(result.text)
				
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 1
				should.exist body[0].attrs.envelope
				
		Scenario "Get a single message without envelope", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=1&fetchEnvelope=false').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should not contains the message envelope", ->
				body = JSON.parse(result.text)
				
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 1
				should.not.exist body[0].attrs.envelope
				
		Scenario "Get a single message with size", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=1&fetchSize=true').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the message size", ->
				body = JSON.parse(result.text)
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 1
				body[0].attrs.size.should.be.a.Number
				body[0].attrs.size.should.be.above 0
				
		Scenario "Get a single message without size", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=1&fetchSize=false').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should not contains the message size", ->
				body = JSON.parse(result.text)
				should.exist body
				body.should.be.instanceof Array
				body.should.have.lengthOf 1
				should.not.exist body[0].attrs.size
				
		Scenario "Send a request with an invalid ids", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?ids=1:').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 400", ->
				result.statusCode.should.be.exactly 400
				
		Scenario "Send a request with an invalid seqs", ->
			result = null
			error = null
			Given "An authenticated user", (done)->
				app.login(done);
			When "I send a message request", (done)->
				request.get('/boxes/INBOX/messages?seqs=1:').end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 400", ->
				result.statusCode.should.be.exactly 400