const express = require('express');
const router = express.Router();
//const mongoose = require('mongoose');
const passport = require('passport');
const moment = require('moment')


// Load Profile and User Model
const Quote = require('../../models/Quote');
const User = require('../../models/User');


// @route   GET api/quote/all
// @desc    Get the quotes for this season
// @access  Public
router.get('/all', (req, res) => {

	const errors = {};
	Quote.find()
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




module.exports = router;