const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


// Load Profile and User Model
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({
	msg: 'Profile Works'
}));

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get('/',(req, res) => {
	// use the authentication and find the user that is logged in,
	// then use his id to find his/her profile
	const errors = {};
	const currentU = "5c537c83bf800917980c2c04" // this is the req.user.id
	Profile.findOne({user: currentU})
		.populate('user', ['name'])
		.then(profile => {
			if (!profile) {
				errors.noprofile = 'There is no profile for this user';
				return res.status(404).json(errors);
			}
			res.json(profile);
		})
		.catch(err => res.status(404).json(err));
});

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', (req, res) => {
	const errors = {};

	Profile.find()
		.populate('user', ['name'])
		.then(profiles => {
			if (!profiles) {
				errors.noprofile = 'There are no profiles';
				return res.status(404).json(errors);
			}
			res.json(profiles);
		})
		.catch(err => res.status(404).json({
			profile: 'There are no profiles'
		}));
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public

router.get('/handle/:handle', (req, res) => {
	const errors = {};

	Profile.findOne({
			handle: req.params.handle
		})
		.populate('user', ['name', 'avatar'])
		.then(profile => {
			if (!profile) {
				errors.noprofile = 'There is no profile for this user';
				res.status(404).json(errors);
			}

			res.json(profile);
		})
		.catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get('/user/:user_id', (req, res) => {
	const errors = {};

	Profile.findOne({
			user: req.params.user_id
		})
		.populate('user', ['name', 'avatar'])
		.then(profile => {
			if (!profile) {
				errors.noprofile = 'There is no profile for this user';
				res.status(404).json(errors);
			}
			res.json(profile);
		})
		.catch(err =>
			res.status(404).json({
				profile: 'There is no profile for this user'
			})
		);
});

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post('/', (req, res) => {
	// const {
	// 	errors,
	// 	isValid
	// } = validateProfileInput(req.body);

	// Check Validation
	// if (!isValid) {
	// 	// Return any errors with 400 status
	// 	return res.status(400).json(errors);
	// }

	// Get fields
	const profileFields = {};
	profileFields.user = req.user.id;
	if (req.body.handle) profileFields.handle = req.body.handle;
	if (req.body.nick_name) profileFields.nick_name = req.body.nick_name;
	if (req.body.role) profileFields.role = req.body.role;
	if (req.body.position) profileFields.position = req.body.position;
	if (req.body.nationality) profileFields.nationality = req.body.nationality;
	if (req.body.from) profileFields.from = req.body.from;
	if (req.body.year) profileFields.year = req.body.year;
	if (req.body.bio) profileFields.bio = req.body.bio;
	if (req.body.phone_number) profileFields.phone_number = req.body.phone_number;
	
	// Social
	profileFields.social = {};
	if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
	if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
	if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
	if (req.body.snapchat) profileFields.social.linkedin = req.body.linkedin;
	if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

	Profile.findOne({
		user: req.user.id
	}).then(profile => {
		if (profile) {
			// Update
			Profile.findOneAndUpdate({
				user: req.user.id
			}, {
				$set: profileFields
			}, {
				new: true
			}).then(profile => res.json(profile));
		} else {
			// Create

			// Check if handle exists
			Profile.findOne({
				handle: profileFields.handle
			}).then(profile => {
				if (profile) {
					errors.handle = 'That handle already exists';
					res.status(400).json(errors);
				}
				// Save Profile
				new Profile(profileFields).save().then(profile => res.json(profile));
			});
		}
	});
});


// @route   DELETE api/profile/delete/:user
// @desc    Delete user and profile
// @access  Private
router.delete('/delete/:user', (req, res) => {
	//this can only be done by the user with an admin role
	const req_user_id = '467364734' //this is the id of the current user
	Profile.findOneAndRemove({
		user: req_user_id
	}).then(() => {
		User.findOneAndRemove({
			_id: req_user_id
		}).then(() =>
			res.json({
				success: true
			})
		);
	});
});

module.exports = router;
