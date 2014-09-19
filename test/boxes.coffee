require('mocha-cakes')
should = require('should')
app = require('./context/appContext')
request = app.request

before (done)->
	app.login(done);

Feature "Get folders",
	"As a user",
	"I want to get the folder list in my mailbox",
	"So that a can use it to fetch my mails", ->

		Scenario "Get folders", ->
			result = null;
			error = null;
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
				body = JSON.parse(result.text);
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

Feature "Get folder",
	"As a user",
	"I want to get the folder data in my mailbox",
	"So that a can use it to fetch my mails", ->

		Scenario "Get an existing folder", ->
			result = null
			error = null
			folder = null
			Given "An valid folder", ->
				folder = 'CustomFolderWithChild'
			When "I send a folder request", (done)->
				request.get('/boxes/' + folder).end (err, res)->
					error = err
					result = res
					done();
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 200", ->
				result.statusCode.should.be.exactly 200
			And "the response should contains the folder data", ->
				body = JSON.parse(result.text);
				should.exist body
				should.exist body.name
				body.name.should.be.type('string')
				body.name.should.be.exactly('CustomFolderWithChild')

		Scenario "Get a folder that does not exist", ->
			result = null
			error = null
			folder = null
			Given "An invalid folder", ->
				folder = 'anInvalidFolder'
			When "I send a folder request", (done)->
				request.get('/boxes/' + folder).end (err, res)->
					error = err
					result = res
					done();
			Then "it should get a result", ->
				should.not.exist error
				should.exist result
			And "the response should be a HTTP 404", ->
				result.statusCode.should.be.exactly 404
				