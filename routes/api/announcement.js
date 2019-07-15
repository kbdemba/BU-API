const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
//const moment = require('moment');

//load user and Announcememt Model
const User = require('../../models/User');
const Announcememt = require('../../models/Announcement');

// @route   GET api/schedule/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({
	msg: 'Announcemnt Works'
}));

// @route   GET api/announcement/all
// @desc    Get all the announcement
// @access  Public
router.get('/all', (req, res) => {
	//automatically delete all the past announcements afte a week. should I? hell naa
	const errors = {};
	Announcememt.find()//get them in date order
		.then(announcement => {
			if (!announcement) { // just sedn them an empty array
				errors.noannouncement = 'There are no announcement for this season';
				return res.status(404).json(errors);
			}
			res.json(announcement);
		})
		.catch(err => res.status(404).json({
			errors
		}));
});

// @route   GET api/announcement/:announcement_id
// @desc    Get announcement by ID
// @access  Public

//change this route a lil bit may api/announcement/view/id  :)
router.get('/:announcement_id', (req, res) => {
	const errors = {};

	Announcememt.findOne({
			_id: req.params.announcement_id
		})
		//.populate the user or 
		.then(announcement => {
			if (!announcement) {
				errors.noannouncement = 'There is no announcement for this id';
				res.status(404).json(errors);
			}
			//return the found announcement
			res.json(announcement);
		})
		.catch(err =>
			res.status(404).json({
				announcement: 'cannotFind' // please do a better job here
			})
		);
});

// @route   POST api/announcement/new
// @desc    Create a announcement
// @access  Private
router.post('/new', 
	//passport.authenticate('jwt', { session: false }),
	(req, res) => {
		// if (!req.user.admin) {
		// 	res.status(401).json({
		// 		notauthorized: 'User not authorized'
		// 	});
		// }
		//res.json({data: req.body})
	// const {
	// 	errors,
	// 	isValid
	// } = validateTrainingInput(req.body);

	// Check Validation
	// if (!isValid) {
	// 	// Return any errors with 400 status
	// 	return res.status(400).json(errors);
	// }

	// // Get fields
	 const announcement_fields = req.body;
	//
	Announcememt.create(req.body)
		.then(practice => res.json(practice))
		.catch(err => res.json(err))
});


// @route   POST api/announcement/edit/:practice_id
// @desc    Edit announcement
// @access  Private
router.put('/edit/:id', 
	//passport.authenticate('jwt', { session: false }),
	(req, res) => {
		// if (!req.user.admin) {
		// 	res.status(401).json({
		// 		notauthorized: 'User not authorized'
		// 	});
		// }
		//res.json({data: req.body})
	// const {
	// 	errors,
	// 	isValid
	// } = validateTrainingInput(req.body);

	// Check Validation
	// if (!isValid) {
	// 	// Return any errors with 400 status
	// 	return res.status(400).json(errors);
	// }

	// // Get fields
	 const announcement_fields = req.body;
	//
	Announcememt.findByIdAndUpdate(req.params.id, req.body, {new: true})
		.then(practice => res.json(practice))
		.catch(err => res.status(404).json({
			practice: 'Error updating Practice',
			err: err.message
		}));
});

// @route   DELETE api/announcement/delete/:announcement_id
// @desc    Delete announcement
// @access  Private
router.delete(
  '/delete/:id',
  //passport.authenticate('jwt', { session: false }),
  (req, res) => {
	  console.log("deleting")
		//check if the user is a coach or assistant coach
		//if (req.user.admin) {
			Announcememt.findByIdAndRemove(req.params.id)
				.then(() => {
					res.json({
						success: true
					})
				})
				.catch(err => res.json({ 
					practice: 'error deleting practice' 
				}));
		//}else{
			// return res
			// 	.status(401).json({
			// 		notauthorized: 'User not authorized'
			// 	});
		//}
  }
);


module.exports = router;