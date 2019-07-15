const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile and User Model
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/player/current
// @desc    get the current user
// @access  private
router.get('/current', 
	passport.authenticate('jwt', { session: false }), 
	(req, res) => {
		Profile.findOne({
				"user.id": req.user._id
			}) 
			.then(profile => {
				if (!profile) {
					//res.status(404).json({noprofile: 'No profile found'});
				}
				res.json(profile);
			})
			.catch(err =>
				res.status(404).json({
					profile: err
					
				})
			);
});

// @route   GET api/players/all
// @desc    get all the players
// @access  private
router.get('/all', (req, res) => {
	const errors={};
	console.log(req.params.filter)
	const filter = {role: req.params.filter}
	Profile.find(filter)
	.then(profiles => {
		res.json(profiles);
	})
	.catch(err => {
		res.status(404).json({
			profile: err.name
		})
	})
});

// @route   GET api/players/all
// @desc    get all the players
// @access  private
router.get('/all/:filter', (req, res) => {
	const filter = {role: req.params.filter}
	Profile.find(filter)
	.then(profiles => {
		res.json(profiles);
	})
	.catch(err => {
		res.status(404).json({
			profile: err.message
		})
	})
});

// @route   GET api/players/id
// @desc    get a player
// @access  public
router.get('/:player_id', (req, res) => {
	const errors = {};
	console.log(req.params.player_id)
	Profile.findOne({_id: req.params.player_id})
		//.populate('user', ['name', 'email']) i dont know why its not working but i think is the way I save it
		.then(profile => {
			res.json(profile);
		})
		.catch(err =>
			res.status(404).json({
				profile: err.message
			})
		);
});


// @route   POST api/player/edit/:player_id
// @desc    Edit Player
// @access  Private
router.put( 
	'/edit/:player_id', 
	passport.authenticate('jwt', { session: false }),
	(req, res) => {

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
	const player_fields = req.body; //{};
	// if (req.body.vs) player_fields.vs = req.body.vs;
	// if (req.body.date) schedule_fields.date = req.body.date;
	// if (req.body.location) schedule_fields.location = req.body.location;
	
	//check if the user is a coach or is the owner of the profile
	//if (req.user.role === 'coach' || req.user.role === 'asst_coach') {
		Profile.findByIdAndUpdate(req.params.player_id, player_fields, {new: true})
			.then(player => res.json(player))
			.catch(err => {
				console.log(err)
				res.status(404).json({
				playernotfound: 'No player found'
			})});
	// }else {
	// 	return res
	// 		.status(401)
	// 		.json({
	// 			notauthorized: 'User not authorized'
	// 		});
	// }

});

// @route   DELETE api/profile/delete/:player.id
// @desc    Delete a profile
// @access  Private
// delete profile then delete the user as well
router.delete('/delete/:profile_id', (req, res) => {
	Profile.findByIdAndRemove(req.params.profile_id).then((profile) => {
		User.findByIdAndRemove(profile.user).then(() => {
			res.json({ success: true })
		
		})
	})
	.catch( err => console.log(err))
});

// @route   DELETE api/player/delete:player_id
// @desc    Delete player
// @access  Private
router.delete(
  '/delete/:player_id/2',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
		//check if the user is a coach or assistant coach
		if (req.user.role === 'coach' || req.user.role === 'asst_coach') {
			Player.findByIdAndRemove(req.params.schedule_id)
				.then(() => {
					res.json({
						success: true
					})
				})
				.catch(err => res.status(404).json({ postnotfound: 'No post found' }));
		}else{
			return res
				.status(401)
				.json({
					notauthorized: 'User not authorized'
				});
		}
  }
);


module.exports = router;