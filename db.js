const mongoose = require('mongoose');

// schema for credit cards
// - type refers to the reward program structure of this credit card
// which can be either reward points (Chase Ultimate Rewards, AmEx Membership Rewards, etc.)
// or straight cash back
// - all data fields from dinning to allOthers indicates the rate of earning cash back/reward points
// e.g. 3 means $0.03 (3%) cash back or 3 reward points per $1 spent
// - redeemValue refers to the maximum value of each reward point in cents
// - travelCredit refers to the dollar amount of travel credit that the card offers
// i.e. the card issuer will reimburse this amount of travel expenses per year
// this field does not apply to American Express issued cards
// - travelCreditAmex refers to the dollar amount of travel credit that the card offers
// this field only applies to American Express issued cards as their travel credit is more restrictive
const cardSchema = new mongoose.Schema({
    name: String,
    type: {type: String, enum: ['reward points', 'cash back']}, 
    slug: String,
    dinning: Number, 
    air: Number,
    hotel: Number,
    otherTravel: Number,
    groceries: Number,
    gas: Number,
    amazon: Number,
    otherOnline: Number,
    allOthers: Number,
    redeemValue: Number, 
    annualFee: Number,
    travelCredit: Number, 
    travelCreditAmex: Number, 
    otherBenefits: [String], 
    highlights: String 
});

// schema for users
// - creditScore refers to the credit score of the user; 
// 670- means that the user's credit score is lower than 670, and 670+ means higher than 670
// - all data fields from dinning to allOthers indicates the dollar amount spent by the 
// user each month on each category
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    creditScore: {type: String, enum: ['no credit', '670-', '670+']},
    dinning: Number, 
    air: Number,
    hotel: Number,
    otherTravel: Number,
    groceries: Number,
    gas: Number,
    amazon: Number,
    otherOnline: Number,
    allOthers: Number
});

// schema for user-card pairs
// when user save a list of cards to their account, user-card pairs will be added
const userCardSchema = new mongoose.Schema({
    userID: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    cardID: {type: mongoose.Schema.Types.ObjectId, ref:'Card'},
    rewards: Number
});

// schema for comments
const commentSchema = new mongoose.Schema({
    username: String,
    cardSlug: String,
    content: String,
    date: Date
});

const Card = mongoose.model('Card', cardSchema);
const User = mongoose.model('User', userSchema);
const UserCard = mongoose.model('UserCard', userCardSchema);
const Comment = mongoose.model('Comment', commentSchema);


/*
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
    const fs = require('fs');
    const path = require('path');
    const fn = path.join(__dirname, 'config.json');
    const data = fs.readFileSync(fn);

    const conf = JSON.parse(data);
    dbconf = conf.dbconf;
} 
else {
    dbconf = 'mongodb://localhost/final';
}
*/
const dbconf = process.env.DB_URI;
mongoose.connect(dbconf);