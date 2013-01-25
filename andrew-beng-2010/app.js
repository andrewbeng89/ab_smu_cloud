/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), user = require('./routes/user'), http = require('http'), path = require('path'), url = require('url'), https = require('https');

var app = express();

app.configure(function() {
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

app.configure('development', function() {
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
		results = todos;
		res.jsonp(results);
	});
});

app.post('/remove/todo', function(req, res) {
	todo.findOneAndRemove({
		_id : req.body.id
	}, function(err) {
		if (!err) {
			console.log("deleted");
		} else {
			console.log("error");
		}
	});
	console.log("sent!");
});

app.get('/places', function(req, res) {
	var _get = url.parse(req.url, true).query;
	var lat = _get['lat'];
	var lon = _get['lon'];
	var type = _get['type'];
	var places = '';

	// Options to be passed to places api call
	var options = {
		host : 'maps.googleapis.com',
		port : 443,
		path : '/maps/api/place/search/json?location=' + lat + ',' + lon + '&radius=300&types=' + type + '&sensor=false&key=AIzaSyART9tG_nt5lPUNSCHo1ancAbgxoq5SoWo',
		method : 'GET'
	};
	res.set('Content-Type', 'text/plain');
	https.get(options, function(response) {
		console.log("Got response: " + response.statusCode);

		response.on("data", function(chunk) {
			//console.log("BODY: " + chunk);
			places += chunk.toString();
		});

		// Process response from places api
		response.on("end", function() {
			var json = JSON.parse(places);
			var results = [];

			// For each entry, process a place and determine the proximity
			for (var i = 0; i < json.results.length; i++) {
				var lat2 = json.results[i].geometry.location.lat;
				var lon2 = json.results[i].geometry.location.lng;
				var place = {
					name : json.results[i].name,
					icon : json.results[i].icon,
					address : json.results[i].vicinity,
					lat : lat2,
					lon : lon2,
					proximity : distBetween(lat, lat2, lon, lon2)
				}
				results.push(place);
			}

			// Sort the places by proximity
			results.sort(function(a, b) {
				return a.proximity - b.proximity;
			});

			// Return the list of places
			res.jsonp(results);
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	});
});

function distBetween(lat1, lat2, lon1, lon2) {

	/*
	 * This module calculates the distance between
	 * 2 geocoded locations (lat and lon). The returned
	 * distance is in km
	 */
	var R = 6371;
	if ( typeof (Number.prototype.toRad) === "undefined") {
		Number.prototype.toRad = function() {
			return this * Math.PI / 180;
		}
	}

	var dLat = parseFloat(lat2 - lat1).toRad();
	var dLon = parseFloat(lon2 - lon1).toRad();
	var lat1 = parseFloat(lat1).toRad();
	var lat2 = parseFloat(lat2).toRad();
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;

	return d;
}

http.createServer(app).listen(app.get('port'), function() {
	console.log("Express server listening on port " + app.get('port'));
});
