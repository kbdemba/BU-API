const express = require('express');
const router = express.Router();
//const mongoose = require('mongoose');
const passport = require('passport');
//const moment = require('moment')
const {handlePushTokens} = require('../../utils/token')


// Load Profile and User Model
const Quote = require('../../models/Quote');
const User = require('../../models/User');


// @route   GET api/quote/all
// @desc    Get the quotes for this season
// @access  Public
router.get('/all', (req, res) => {

	const errors = {};
	Quote.find().sort({})
		.then(quotes => {
			if (!quotes) {
				errors.noprofile = 'There are no quotes for this season';
				return res.status(404).json(errors);
			}
			res.json(quotes);
		})
		.catch(err => res.status(404).json({
			quotes: 'Error finding quotes'
		}));
});

let currentQuoteId;
router.get('/current_quote/', (req, res) => {
	Quote.findById(currentQuoteId)
		.then(quote => {
			console.log(quote)
			res.json(quote);
		})
		.catch(err => res.status(404).json({
			quote: 'Error finding current Quote'
		}));
});

//make a quote
router.post('/new', (req, res) => {
	//be authenticated
	//be an Admin
	
	Quote.create(req.body)
		.then(quote => {
			res.json(quote)
			//message: `practice for ${practice.team} AT ${practice.team} with moment.js`
			handlePushTokens({
				title: 'New Motivatinal Quote Added',
				message: `${quote.quote.substring(0, 100)}`
			});

		})
		.catch(err => {
			res.json(err.message)
		});

}); 
router.post('/current_quote/:id', (req, res) => {
	//be logged in
	//be an Admin or maybe captain
	currentQuoteId = req.params.id
	Quote.findById(req.params.id)
		.then(quote => {
			res.json({success: true});
			handlePushTokens({
				title: 'Daily Motivatinal Quote Added',
				message: `${quote.quote.substring(0, 100)}`
			});

		})
		.catch(err => res.status(404).json({
			quote: 'Error finding current Quote'
		}));
	
	
	
});

// @route   POST api/quote/edit/:quote_id
// @desc    Edit game
// @access  Private
router.put(
	'/edit/:quote_id', 
	//passport.authenticate('jwt', { session: false }),
	(req, res) => {
		// if (!req.user.admin) {
		// 	return res.status(401).json({unauthorized: 'User not authorized'});
		// }
		// const {
		// 	errors,
		// 	isValid, 
		// 	data
		// } = validateQuote(req.body);

		// //Check Validation
		// if (!isValid) {
		// 	// Return any errors with 400 status
		// 	return res.status(400).json(errors);
		// }

		Quote.findByIdAndUpdate(req.params.quote_id, req.body, {new: true})
			.then(updatedQuote => {
				res.json(updatedQuote) 
			})
			.catch(err => {
				console.log(err)
				res.status(404).json({ //do a better job
				quoteError: 'Error updating game'
				})
			}
			)
});

router.delete(
  '/delete/:quote_id',
  //passport.authenticate('jwt', { session: false }),
  (req, res) => {
		//check if the user is a coach or assistant coach
		//if (req.user.role === 'coach' || req.user.role === 'asst_coach') {
			Quote.findByIdAndRemove(req.params.quote_id)
				.then(() => {
					res.json({
						success: true
					})
				})
				.catch(err => res.status(404).json({ postnotfound: 'No post found' }));//do a better job
		// }else{
		// 	return res
		// 		.status(401)
		// 		.json({
		// 			notauthorized: 'User not authorized'
		// 		});
		// }
  }
);


module.exports = router;