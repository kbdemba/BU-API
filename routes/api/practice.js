const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const moment = require('moment');

const {getUpcomingEvents} = require('../../utils')

// Load Practice Model
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Schedule = require('../../models/Game');
const Practice = require('../../models/Practice');

const validatePractice = require('../../validation/practice');

// @route   GET api/schedule/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({
	msg: 'Profile Works'
}));

// @route   GET api/practice/all
// @desc    Get the practice for this season or for the week
// @access  Public
router.get('/all', (req, res) => {
	const errors = {};
	Practice.find()
		.then(practice => {
			if (!practice) {
				// i dont think so
				errors.noPractice = 'There are no practice for this season';
				return res.status(404).json(errors);
			}
			res.json(practice);
		})
		.catch(err => res.status(404).json({
			[err.name]: err.message
		}));
});

// @route   GET api/practice/upcoming_practice
// @desc    Get the practice for the day or the next day
// @access  Public
router.get('/upcoming_practices', (req, res) => {
	const errors = {};
	Practice.find({dateAndTime: {$gte: new Date()}}) // 
		.sort({date: 1})
		.limit(4)
		.then(practices => {
			if (!practices) {// return an empty object
				console.log('no practice found')
				//errors.noprofile = 'There are no practice for this season';
				//return res.status(404).json(errors);
				res.json(practices);
			}
			res.json(practices);
		})
		.catch(err => res.status(404).json({
			upcoming: err.message
		}));

});

// @route   GET api/practice/:practice_id
// @desc    Get Schedule by ID
// @access  Public

router.get('/:practice_id', (req, res) => {
	const errors = {};
	Practice.findOne({
			_id: req.params.practice_id
		})
		.then(practice => {
			if (!practice) {
				errors.nopractice = 'There is no practice for this id';
				res.status(404).json(errors);
			}
			res.json(practice);
		})
		.catch(err =>
			res.status(404).json({
				practice: 'cannot Find Practice'
			})
		);
});

// @route   POST api/practice/new
// @desc    Create a practice
// @access  Private
router.post('/new', 
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		if (!req.user.admin) {
			return res.status(401).json({
				notauthorized: 'User not authorized'
			});
		}
		//res.json({data: req.body})
	const {
		errors,
		isValid,
		data,
	} = validatePractice(req.body);

	//Check Validation
	if (!isValid) {
		// Return any errors with 400 status
		return res.status(400).json(errors);
	}
	
	Practice.create(data) // DO A BETTER ERROR HANDLING
		.then(practice => res.json(practice))
		.catch(err => res.json(err.message))
});


// @route   POST api/practice/edit/:practice_id
// @desc    Edit practice
// @access  Private
router.put(
	'/edit/:practice_id', 
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		//check if the user is a coach, ass Coach or a Graduate Assistant
		//coach, ass coach and grad Ass will all be Admins
		if (!req.user.admin) {
			return res.status(401).json({
				notauthorized: 'User not authorized'
			});
		}
		const {
			errors,
			isValid,
			data
		} = validatePractice(req.body);

		//Check Validation
		if (!isValid) {
			// Return any errors with 400 status
			return res.status(400).json(errors);
		}
	
		Practice.findByIdAndUpdate(req.params.practice_id, practice_fields, {new: true})
			.then(practice => res.json(practice))
			.catch(err => res.status(404).json({
				practice: 'Error updating Practice'
			}));
	
});


// @route   DELETE api/practice/delete:practice_id
// @desc    Delete practice
// @access  Private
router.delete(
  '/delete/:practice_id',
	passport.authenticate('jwt', { session: false }),
  (req, res) => {
		//check if the user is a coach or assistant coach
		if (req.user.admin) {
			Practice.findByIdAndRemove(req.params.practice_id)
				.then(() => {
					res.json({success: true})
				})
				.catch(err => res.status(404).json({ //i tink no need to put the status here
					practice: 'error deleting practice' 
				}));
		}else{
			return res
				.status(401).json({
					notauthorized: 'User not authorized'
				});
		}
  }
);



module.exports = router;
