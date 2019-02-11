// initialization
const path = require('path');
const express = require('express'); 
const session = require('express-session');
const db = require('./db');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const passportConfig = require('./passport-config.js'); //passport configuration file

const Card = mongoose.model('Card');
const User = mongoose.model('User');
const UserCard = mongoose.model('UserCard');
const Comment = mongoose.model('Comment');
const app = express();

// setting the view engine
app.set('view engine', 'hbs');

// setting up middlewares
app.use(express.json());

app.use(flash()); // getting flash messages (for passport)

const staticPath = path.resolve(__dirname, 'public');
app.use(express.static(staticPath)); 

app.use(express.urlencoded({extended: false})); 

const sessionOptions = { 
	secret: 'this is a Super Secure Secret String', 
	saveUninitialized: false, 
	resave: false 
};
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

// setting the routes
app.get('/', (req, res) => {
	if (req.user) {
		res.render('homepage', {homeActive: 'active', username: req.user.username});
	}
	else {
		res.render('homepage', {homeActive: 'active'});
	}
});

app.get('/about', (req, res) => {
	if (req.user) {
		res.render('about', {aboutActive: 'active', username: req.user.username});
	}
	else {
		res.render('about', {aboutActive: 'active'});
	}
});

app.get('/all-cards', (req, res) => {
	const headerMsg = 'All cards';
	const infoMsg = 'Below are all credit cards in our database. Note that this list does not reflect all available cards on the market; we have filtered and selected some of the most competitive ones beforehand.';
	Card.find(function(err, card, count) {
		if (req.user) {
			res.render('show-cards', {username: req.user.username, allActive: 'active', headerMsg: headerMsg, infoMsg: infoMsg, allCards: card});
		}
		else {
			res.render('show-cards', {allActive: 'active', headerMsg: headerMsg, infoMsg: infoMsg, allCards: card});
		}
	});
});

app.get('/all-cards/:slug', (req, res) => {
	const slug = req.params.slug;
	Card.findOne({slug: slug}, function(err, card, count) {
		if (err) {
			if (req.user) {
				res.render('card-detail', {username: req.user.username});
			}
			else {
				res.render('card-detail');
			}
		}
		if (req.user) {
			res.render('card-detail', {card: card, allActive: 'active', username: req.user.username});
		}
		else {
			res.render('card-detail', {card: card, allActive: 'active'});
		}
	});
});

app.get('/best-cards', (req, res) => {
	if (req.user) {
		res.render('best-cards', {username: req.user.username, bestActive: 'active'});
	}
	else {
		res.redirect('/login');
	}
});

app.post('/best-cards/result', (req, res) => {
	const headerMsg = 'Here are the best cards for you!';
	const infoMsg = 'Our calculation shows that you can maximize your returns on everyday spend by using one of these cards.';
	
	//if user selects no credit or credit score <670, display a generic page
	if (req.body['credit-selection'] === 'bad-credit' || req.body['credit-selection'] === 'no-credit') {
		res.render('no-bad-credit', {bestActive: 'active'});
	}
	//otherwise, calculate the rewards for each card and display a customized
	else {
		Card.find(function(err, card, count) {

			//if user selects cash back, then limit the results shown to cash back cards (filter out reward points cards)
			if (req.body['reward-type-selection'] !== 'reward-points') {
				card = card.filter(c => c.type === 'cash back');
			}

			//calculate monthly rewards for every card
			for (let i = 0; i < card.length; i++) {

				//"gross" rewards
				let rewards = 0;
				const rewardsObj = {};
				const spendObj = {};

				spendObj.dining = parseFloat(req.body.dining);
				rewardsObj.dining = parseFloat(req.body.dining) * card[i].dinning / 100;

				spendObj.air = parseFloat(req.body.air);
				rewardsObj.air = parseFloat(req.body.air) * card[i].air / 100;

				spendObj.hotel = parseFloat(req.body.hotel);
				rewardsObj.hotel = parseFloat(req.body.hotel) * card[i].hotel / 100;

				spendObj.otherTravel = parseFloat(req.body.otherTravel);
				rewardsObj.otherTravel = parseFloat(req.body.otherTravel) * card[i].otherTravel / 100;

				spendObj.groceries = parseFloat(req.body.groceries);
				rewardsObj.groceries = parseFloat(req.body.groceries) * card[i].groceries / 100;

				spendObj.gas = parseFloat(req.body.gas);
				rewardsObj.gas = parseFloat(req.body.gas) * card[i].gas / 100;

				spendObj.amazon = parseFloat(req.body.amazon);
				rewardsObj.amazon = parseFloat(req.body.amazon) * card[i].amazon / 100;

				spendObj.online = parseFloat(req.body.online);
				rewardsObj.online = parseFloat(req.body.online) * card[i].otherOnline / 100;

				spendObj.allOther = parseFloat(req.body.allOther);
				rewardsObj.allOther = parseFloat(req.body.allOther) * card[i].allOthers / 100;

				for (const category in rewardsObj) {
					rewards += rewardsObj[category];
				}
				
				//calculate the effective annual fee
				let effectiveAnnualFee = card[i].annualFee;
				if (card[i].travelCredit !== 0) {
					const annualTravelPurchase = (parseFloat(req.body.air) + parseFloat(req.body.hotel) + parseFloat(req.body.otherTravel)) * 12;
					const effectiveCredit = Math.min(card[i].travelCredit, annualTravelPurchase);
					effectiveAnnualFee = effectiveAnnualFee - effectiveCredit;
				}
				else if (card[i].travelCreditAmex !== 0){
					const annualTravelPurchase = parseFloat(req.body.air) * 12;
					const effectiveCredit = Math.min(card[i].travelCreditAmex, annualTravelPurchase);
					effectiveAnnualFee = effectiveAnnualFee - effectiveCredit;
				}

				//calculate "net" rewards for each month ((gross-annual fee/12)*value per point = net)
				rewardsObj.effectiveAnnualFee = Math.round(effectiveAnnualFee / 12);
				rewardsObj.grossRewards = Math.round(rewards);

				rewards = rewards * card[i].redeemValue - (effectiveAnnualFee / 12);
				card[i].rewards = Math.round(rewards);
				card[i].calcDetails = rewardsObj;
				card[i].spend = spendObj;
			}

			//sort cards (highest amount of rewards first)
			card.sort(function(a, b) {
				return b.rewards - a.rewards;
			});

			//filter out cards with a negative monthly rewards (i.e. user will end up losing money by using this card)
			const filteredResult = card.filter(c => c.rewards > 0);

			//formatting and saving the results to req.session
			const cardWithRewards = [];
			filteredResult.forEach(c => cardWithRewards.push({userID: req.user._id, cardID: c._id, rewards: c.rewards}));
			req.session.userCardList = cardWithRewards;
		
			//rendering results
			if (filteredResult.length > 0) {
				res.render('show-cards', {username: req.user.username, bestActive: 'active', headerMsg: headerMsg, infoMsg: infoMsg, resultCards: filteredResult});
			}
			else {
				res.render('show-cards', {username: req.user.username, bestActive: 'active', headerMsg: "Oops...", infoMsg: "It seems that we cannot find any recommended cards for you."});
			}
		});
	}
});

app.get('/my-cards', (req, res) => {
	if (!req.user) {
		res.redirect('/login');
	}
	else {

		//find user-card pairs in db for the given user
		UserCard.find({userID: req.user._id}).populate('cardID').exec(function(err, pairs) {
			if (err) {
				console.log(err + '');
				res.redirect('/');
			}
			else {

				//formatting and rendering results
				const toDisplay = [];
				pairs.forEach(p => toDisplay.push({name: p.cardID.name, slug: p.cardID.slug, rewards: p.rewards}));
				res.render('my-cards', {cards: toDisplay, username: req.user.username, myActive: 'active'});
			}
		});
	}
});

// for saving the list of cards to "my cards"
app.get('/save', (req, res) => {
	if (!req.user) {
		res.redirect('/login');
	}
	else {
			
		//getting the list
		const list = req.session.userCardList;

		//if there's no list, redirect to home page
		if (!list || list.length === 0) {
			res.redirect('/');
		}

		//delete previous records
		UserCard.deleteMany({userID: req.user._id}, function(err) {
			if (err) {
				console.log('err: ' + err);
				res.redirect('/');
			}
			else {

				//insert new records
				UserCard.insertMany(list, function(err, saved) {
					if (err) {
						console.log('err:' + err);
						res.redirect('/');
					}
					else {
						res.redirect('/my-cards');
					}
				});
			}
		});
	}
});

app.get('/login', (req, res) => {
	const msg = req.flash('error')[0];
	res.render('login', {message: msg});
});

app.post('/login', passport.authenticate('login', {
	successRedirect: '/my-cards',
	failureRedirect: '/login',
	failureFlash: true
}));

app.get('/register', (req, res) => {
	const msg = req.flash('error')[0];
	res.render('register', {message: msg});
});

app.post('/register', passport.authenticate('register', {
	successRedirect: '/my-cards',
	failureRedirect: '/register',
	failureFlash: true
}));

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

app.get('/api/comments', (req, res) => {
	const currentCard = req.query.card;

	Comment.find({cardSlug: currentCard}, function(err, comments, count) {
		res.json(comments);
	});
});

app.post('/api/comments', (req, res) => {
	const comment = new Comment({
		username: req.body.username,
		cardSlug: req.body.cardSlug,
		content: req.body.comment,
		date: new Date()
	});

	comment.save(function(err, comment, count) {
		if (err) {
			res.status(500); //send a 500 status if the we encounter a failure in saving the comment
		}
		else {
			res.json(comment);	
		}
	});
});

app.listen(process.env.PORT || 3000);