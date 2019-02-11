//configuration file for passport in app.js

//setting up
const db = require('./db');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const User = mongoose.model('User');

//login strategy
passport.use('login', new Strategy({
	passReqToCallback: true
	},
	function(req, username, password, cb) {
		User.findOne({username: username}, (err, user, count) => {
			if (err) {
				cb(err);
			}
			else if (!user) {
				return cb(null, false, {message: 'we cannout find the username'});
			}
			else {
				bcrypt.compare(password, user.password, (err, passwordMatch) => {
					if (passwordMatch) {
						return cb(null, user);
					}
					else {
						return cb(null, false, {message: 'the password you entered is wrong'});
					}
				});
			}
		});
	}
));

//sign up strategy
passport.use('register', new Strategy({
	passReqToCallback: true
	},
	function(req, username, password, cb) {
		User.findOne({username: username}, (err, user, count) => {
			if (err) {
				cb(err);
			}
			else if (user) {
				return cb(null, false, {message: 'the username already exists'});
			}
			else {
				
				//hashing the password and saving the new user to db
				bcrypt.hash(password, 10, function(err, hash) {
					const newUserDetails = {};
					newUserDetails.username = username;
					newUserDetails.email = req.body.email;
					newUserDetails.password = hash;
	
					const newUser = new User(newUserDetails);
					newUser.save(function(err, user, count) {
						if (err) {
							return cb(null, false, {message: '' + err});
						}
						else {
							return cb(null, user);
						}
					});
				});
			}
		});
	}
));

passport.serializeUser(function(user, cb) {
	cb(null, user._id);
});
   
passport.deserializeUser(function(id, cb) {
	User.findOne({_id: id}, (err, user, count) => {
		if (err) {
			return cb(err);
		}
		cb(null, user);
	});
});