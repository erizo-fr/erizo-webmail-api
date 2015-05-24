require("mocha-cakes")
should = require("should")
app = require("./context/appContext")
request = app.request

Feature "Send message",
	"As a user",
	"I want to send some messages to my friends",
	"So I can tell craps about them", ->

		Scenario "Unauthenticated user", ->
			result = null
			error = null
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a new message", (done)->
				request.post("/messages").end (err, res)->
					error = err
					result = res
					done()
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401

		Scenario "Send a message", ->
			result = null
			error = null
			messageSubject = "Feature SendMessage Scenario SendMessage"
			messageFrom = "testuser@mydomain.com"
			messageTo = "testuser@mydomain.com"
			messageText = "It's me, Mario !"
			messageInInbox = null
			messageInSent = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a new message", (done)->
				body = {
					from: messageFrom,
					to: messageTo,
					subject: messageSubject,
					text: messageText
				}
				request.post("/messages")
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
			And "the message should be in the sent box", (done)->
				request.get("/boxes/Sent").end (err, res)->
					if err
						done err, res
					else
						res.statusCode.should.be.exactly 200
						box = JSON.parse res.text
						should.exist box.highestmodseq
						request.get("/boxes/Sent/messages?fetchEnvelope=true&seqs=" + box.highestmodseq).end (err, res)->
							should.not.exist err
							should.exist res
							should.exist res.text
							messageInSent = JSON.parse res.text
							should.exist messageInSent
							messageInSent.should.be.instanceof Array
							messageInSent.should.have.lengthOf 1
							messageAttrs = messageInSent[0].attrs
							should.exist messageAttrs
							should.exist messageAttrs.modseq
							messageAttrs.modseq.should.be.exactly box.highestmodseq
							should.exist messageAttrs.envelope
							should.exist messageAttrs.envelope.subject
							messageAttrs.envelope.subject.should.be.exactly messageSubject
							done()


			And "the message should be in the the recipent INBOX", (done)->
				request.get("/boxes/INBOX").end (err, res)->
					if err
						done(err, res)
					else
						#Get the last message in box
						res.statusCode.should.be.exactly 200
						box = JSON.parse res.text
						should.exist box.highestmodseq
						request.get("/boxes/INBOX/messages?fetchEnvelope=true&seqs=" + box.highestmodseq).end (err, res)->
							should.not.exist err
							should.exist res
							should.exist res.text
							messageInInbox = JSON.parse res.text
							should.exist messageInInbox
							messageInInbox.should.be.instanceof Array
							messageInInbox.should.have.lengthOf 1
							messageAttrs = messageInInbox[0].attrs
							should.exist messageAttrs
							should.exist messageAttrs.modseq
							messageAttrs.modseq.should.be.exactly box.highestmodseq
							should.exist messageAttrs.envelope
							should.exist messageAttrs.envelope.subject
							messageAttrs.envelope.subject.should.be.exactly messageSubject
							done()

		Scenario "Send to multiple recipients", ->
			result = null
			error = null
			messageSubject = "Feature SendMessage Scenario SendMessageToMultipleRecipients"
			messageFrom = "testuser@mydomain.com"
			messageTo = [{address:"testuser@mydomain.com"}, {address:"testuser@mydomain.com"}]
			messageText = "It's me, Mario !"
			messageInInbox = null
			messageInSent = null
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a new message", (done)->
				body = {
					from: messageFrom,
					to: messageTo,
					subject: messageSubject,
					text: messageText
				}
				request.post("/messages")
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
			And "the message should be in the sent box", (done)->
				request.get("/boxes/Sent").end (err, res)->
					if err
						done err, res
					else
						res.statusCode.should.be.exactly 200
						box = JSON.parse res.text
						should.exist box.highestmodseq
						request.get("/boxes/Sent/messages?fetchEnvelope=true&seqs=" + box.highestmodseq).end (err, res)->
							should.not.exist err
							should.exist res
							should.exist res.text
							messageInSent = JSON.parse res.text
							should.exist messageInSent
							messageInSent.should.be.instanceof Array
							messageInSent.should.have.lengthOf 1
							messageAttrs = messageInSent[0].attrs
							should.exist messageAttrs
							should.exist messageAttrs.modseq
							messageAttrs.modseq.should.be.exactly box.highestmodseq
							should.exist messageAttrs.envelope
							should.exist messageAttrs.envelope.subject
							messageAttrs.envelope.subject.should.be.exactly messageSubject
							done()


			And "the message should be in the the recipent INBOX", (done)->
				request.get("/boxes/INBOX").end (err, res)->
					if err
						done(err, res)
					else
						#Get the last message in box
						res.statusCode.should.be.exactly 200
						box = JSON.parse res.text
						should.exist box.highestmodseq
						request.get("/boxes/INBOX/messages?fetchEnvelope=true&seqs=" + box.highestmodseq).end (err, res)->
							should.not.exist err
							should.exist res
							should.exist res.text
							messageInInbox = JSON.parse res.text
							should.exist messageInInbox
							messageInInbox.should.be.instanceof Array
							messageInInbox.should.have.lengthOf 1
							messageAttrs = messageInInbox[0].attrs
							should.exist messageAttrs
							should.exist messageAttrs.modseq
							messageAttrs.modseq.should.be.exactly box.highestmodseq
							should.exist messageAttrs.envelope
							should.exist messageAttrs.envelope.subject
							messageAttrs.envelope.subject.should.be.exactly messageSubject
							done()
