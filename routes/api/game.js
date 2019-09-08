const express = require('express');
const router = express.Router();
const passport = require('passport');
const moment = require('moment')

const {handlePushTokens} = require('../../utils/token')

// Load Profile and User Model
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Game = require('../../models/Game');

//Validators
const validateGame = require('../../validation/game');


// @route   GET api/Game/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => {
	Game.find().sort({
		date: 1
	})
		//.populate('user', ['name'])
		.then(games => {
			if (!games) {
				errors.noprofile = 'There are no games for this season';
				return res.status(404).json(errors);
			}
			res.json(games);
		})
		.catch(err => res.status(404).json({
			profile: 'Error finding games'
		}));
});

// @route   GET api/game/all
// @desc    Get the games for this season
// @access  Public
router.get('/all', 
	passport.authenticate('jwt', { session: false }),
	(req, res) => {

	const errors = {};
	Game.find().sort({gameDate: 1}) 
		.populate({ path: 'roster', select: 'firstName lastName position' })
		.then(games => {
			res.json(games);
		})
		.catch(err => res.status(404).json({
			games: 'Error finding games'
		}));
});

// @route   GET api/game/upcoming_games
// @desc    Get coming games in the next week or the nearest coming game...
// @access  Public/Private
router.get('/upcoming_games', (req, res) => {
	const errors = {};
	console.log('up coming games')
	Game.find({dateAndTime: {$gte: new Date()}})
		.sort({date: 1})
		.limit(1)
		.populate({ path: 'roster', select: 'firstName lastName position' })
		.then(games => {
			if (!games) {
				// i dont htink i should do this
				//errors.game = 'No Upcoming Games for this Season';
				//return res.status(404).json(errors);
			}
			
			res.json(games);
		})
		.catch(err => {
			console.log(err)
		})

});

// @route   GET api/game/:game_id
// @desc    Get game by ID
// @access  Public
router.get('/:game_id', (req, res) => {
	const errors = {};
	Game.findOne({
			_id: req.params.game_id
		})
		//.populate('roster')
		.then(game => {
			if (!game) {
				errors.noGame = 'There is no game for this user';
				res.status(404).json(errors);
			}
			res.json(game);
		})
		.catch(err =>
			res.status(404).json({
				game: err
			})
		);
});


// @route   POST api/game/new
// @desc    Create a new Game
// @access  Private
//wait untill you decide weather to make a team its own model
router.post('/new', 
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		//if the user is not admin, dont let them pass here
		if (!req.user.admin) {
			return res.status(401).json({
				unauthorized: 'User not authorized'
			});
		}

	const {
		errors,
		isValid,
		data,
	} = validateGame(req.body);

	//Check Validation
	if (!isValid) {
		// Return any errors with 400 status
		return res.status(400).json(errors);
	}
	//data.roster = ['5d00d7f12af8db344eb581c8', '5d0a3b392cc90dd7d83c4461', '5d0a3b5a2cc90dd7d83c4463'];
	Game.create(data)
		.then(game => {
			res.json(game)
			//message: `practice for ${practice.team} AT ${practice.team} with moment.js`
			handlePushTokens({
				title: 'New Game Added',
				message: 'vs Name, date, time, venue, type'
			});
		})
		.catch(err => res.json(err))
});

// @route   POST api/game/edit/:game_id
// @desc    Edit game
// @access  Private
router.put(
	'/edit/:game_id', 
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		if (!req.user.admin) {
			return res.status(401).json({unauthorized: 'User not authorized'});
		}
		const {
			errors,
			isValid, 
			data
		} = validateGame(req.body);

		//Check Validation
		if (!isValid) {
			// Return any errors with 400 status
			return res.status(400).json(errors);
		}

		Game.findByIdAndUpdate(req.params.game_id, data)
			.then(game => {
				Game.findById(game._id)
					.populate({ path: 'roster', select: 'firstName lastName position' })
					.then(Updatedgame => {
						res.json(Updatedgame) 
						//message: `practice for ${practice.team} AT ${practice.team} with moment.js`
						//check if its the roster thats benn updated and the name of the team
						//you are playing against
						handlePushTokens({
							title: 'Game',
							message: 'Roster Updated for William Carey Game'
						});
					})
			})
			.catch(err => {
				console.log(err)
				res.status(404).json({ //do a better job
				gamenotfound: 'Error updating game'
				})
			}
			)
});



// @route   DELETE api/game/delete/:id
// @desc    Delete post
// @access  Private
router.delete(
  '/delete/:game_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
		//check if the user is a coach
		if (req.user.admin) {
			Game.findByIdAndRemove(req.params.game_id)
				.then(() => {
					res.json({
						success: true
					})
				})
				.catch(err => res.status(404).json({
					postnotfound: 'Error deleting game' 
				}));
		}else{
			return res
				.status(401)
				.json({
					notauthorized: 'User not authorized'
				});
		}
  }
);

// Game.create({})
// 	.then(game => res.json(game))
// 	.catch(err => res.json(err))

// const newGame = {
// 	teamName: 'LALALA',
// 	teamColor: 'red',
// 	GameDate: '08/12/19',
// 	GameTime: '04:00 PM',
// 	venue: 'Home',
// 	gameType: 'Conference'
// } 
// Game.create(newGame)
// 	.then(game => console.log(game))
// 	.catch(err => console.log(err))

module.exports = router;
