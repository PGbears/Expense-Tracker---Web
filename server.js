var express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override');					//npm list for version
	
	mongoose.connect('mongodb://localhost/expenses', function(err){
		if(err){
			console.log('Error: ' + err);
		}else{
			console.log('Connected to MongoDB');
		};
	});
		
	app.use(morgan('dev'));                                         // log every request to the console
	app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
	app.use(bodyParser.json());                                     // parse application/json
	app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
	app.use(methodOverride());
	
	var Expense = mongoose.model('Expense', {
		place: String,
		amount: Number,
		date: Date,
		category: String
	});
	
	var Goal = mongoose.model('Goal', {
		value: Number,
		date: Date
	});
	
	app.get('/api/expenses', function(req, res){
		Expense.find(function(err, expenses){
			if(err){
				res.send(err);
			}else{
				res.json(expenses);
			}
		});
	});
	
	app.get('/api/goals', function(req, res){
		Goal.find(function(err, goals){
			if(err){
				res.send(err);
			}else{
				res.json(goals);
			};
		});
	});	
	
	app.post('/api/expenses', function(req, res){
		Expense.create({
			place: req.body.place,
			amount: req.body.amount,
			date: new Date(),
			category: req.body.category
		}, function(err, expenses){
			if(err){
				res.send(err);
			}else{
				Expense.find(function(err, expenses){
					if(err){
						res.send(err);
					}else{
						res.json(expenses);
					}
				});
			}
		});
	});
	
	app.post('/api/goals', function(req, res){
		Goal.create({
			value: req.body.value,
			date: new Date()
		}, function(err, goals){
			if(err){
				res.send(err);
			}else{
				Goal.find(function(err, goals){
					if(err){
						res.send(err);
					}else{
						res.json(goals);
					}
				});
			}
		});
	});		
	
	app.delete('/api/expenses/:expense_id', function(req, res){
		Expense.remove({
			_id: req.params.expense_id
		}, function(err, expense){
			if (err)
				res.send(err);
				
			Expense.find(function(err, expenses){
				if(err)
					res.send(err)
				res.json(expenses);
			});
		});
	});
		
	app.get('/angles.js', function(req,res){
		res.sendfile('angles.js');
	});
	
	app.get('/core.js', function(req,res){
		res.sendfile('core.js');
	});
	
	app.get('/style.css', function(req,res){
		res.sendfile('style.css');
	});
	
	app.get('/animate.css', function(req,res){
		res.sendfile('animate.css');
	});
	
	app.get('/home', function(req, res){
		res.sendfile('index.html');
	});
	
	app.listen(8081);
	console.log("App listening on port 8081");
	
	
	
	
	
	