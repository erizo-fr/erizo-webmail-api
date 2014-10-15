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
				messageAttrs = body[0].attrs
				should.exist messageAttrs
				should.exist messageAttrs.uid
				messageAttrs.uid.should.be.exactly 13
				
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
				should.exist body
				should.exist body.attrs
				should.exist body.attrs.uid
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
				messageAttrs = body[0].attrs
				should.exist messageAttrs
				should.exist messageAttrs.modseq
				messageAttrs.modseq.should.be.exactly '1'
				
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
				text = result.res.text
				should.exist text
				text.should.be.exactly 'Only one of ids or seqs param must be given'
				
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
				text = result.res.text
				should.exist text
				text.should.be.exactly 'Only one of ids or seqs param must be given'
				
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
				messageAttrs = body[0].attrs
				should.exist messageAttrs
				messageStruct = messageAttrs.struct
				should.exist messageStruct
				messageStruct.should.be.instanceof Array
				messageStruct.length.should.be.above 0
				
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
				messageAttrs = body[0].attrs
				should.exist messageAttrs
				messageStruct = messageAttrs.struct
				should.not.exist messageStruct
				
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
				messageAttrs = body[0].attrs
				should.exist messageAttrs
				messageEnvelope = messageAttrs.envelope
				should.exist messageEnvelope
				
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
				messageAttrs = body[0].attrs
				should.exist messageAttrs
				messageEnvelope = messageAttrs.envelope
				should.not.exist messageEnvelope
				
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
				messageAttrs = body[0].attrs
				should.exist messageAttrs
				messageSize = messageAttrs.size
				should.exist messageSize
				messageSize.should.be.a.Number
				messageSize.should.be.above 0
				
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
				messageAttrs = body[0].attrs
				should.exist messageAttrs
				messageSize = messageAttrs.size
				should.not.exist messageSize
				
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