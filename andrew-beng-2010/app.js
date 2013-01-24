
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.enable("jsonp callback");
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

var mongoose = require('mongoose'), todo = require('./models/todo');

mongoose.connect('mongodb://test:test1234@ds047217.mongolab.com:47217/is429_todo');

app.post('/create/todo', function(req, res) {
	var newTodo = new todo();
	newTodo.text = req.body.text;
	newTodo.done = req.body.done;
	newTodo.save();
	console.log(req.body);
	res.send(req.body);
});

app.get('/todos', function(req, res) {
	var results;
	todo.find(function(err, todos) {
		if (err) {
			results = "something went wrong";
		}
		results =  todos;
		res.jsonp(results);
	});
});

app.post('/remove/todo', function (req, res) {
	todo.findOneAndRemove({_id:req.body.id}, function(err) {
		if (!err) {
			console.log("deleted");
		} else {
			console.log("error");
		}
	});
	console.log("sent!");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
