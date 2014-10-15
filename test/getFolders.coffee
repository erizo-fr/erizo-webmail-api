require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
request = app.request

Feature "Get folders",
	"As a user",
	"I want to get the folder list in my mailbox",
	"So that a can use it to fetch my mails", ->
		
		Scenario "Unauthenticated user", ->
			result = null;
			error = null;
			Given "An unauthenticated user", (done)->
				app.logout(done)
			When "I send a folder request", (done)->
				request.get('/boxes').end (err, res)->
					error = err;
					result = res;
					done();
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 401", ->
				result.statusCode.should.be.exactly 401

		Scenario "Get folders", ->
			result = null;
			error = null;
			Given "An authenticated user", (done)->
				app.login(done)
			When "I send a folder request", (done)->
				request.get('/boxes').end (err, res)->
					error = err;
					result = res;
					done();
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the folder list", ->
				body = JSON.parse(result.text)
				should.exist body['INBOX']
				should.exist body['Drafts']
				should.exist body['Sent']
				should.exist body['Trash']
				should.exist body['CustomFolderWithoutChild']
				should.exist body['CustomFolderWithoutChild']['attribs']
				body['CustomFolderWithoutChild']['attribs'].should.containEql '\\HasNoChildren'
				body['CustomFolderWithoutChild']['attribs'].should.not.containEql '\\HasChildren'
				should.exist body['CustomFolderWithChild']
				should.exist body['CustomFolderWithChild']['attribs']
				body['CustomFolderWithChild']['attribs'].should.containEql '\\HasChildren'
				body['CustomFolderWithChild']['attribs'].should.not.containEql '\\HasNoChildren'
				should.exist body['CustomFolderWithChild']['children']
				should.exist body['CustomFolderWithChild']['children']['CustomSubFolder']