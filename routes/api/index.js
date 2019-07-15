const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//load models
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Announcement = require('../../models/Announcement');
const Quote = require('../../models/Quote');

//Validators
const validateLoginInput = require('../../validation/index/login');
const validateUpdatePW = require('../../validation/index/updatePW');

//add an Admin or coach
//make all async functions future
router.post(`/register_coach`, (req, res) => {
	//const CoachPassword = process.env.ADMIN_PASSWORD should hash this or not
	//secretCode = thisIsAsecret
	if (req.body.secretCode != process.env.ADMIN_PASSWORD){
		res.json({error: 'wrong secret'})
	}
	User.findOne({email: req.body.email}).then(user => {
		if(user){
			res.json({error: 'User already exist'})
		}else {
			const newUser = new User({
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: req.body.email,
				password: `${req.body.firstName}BU19`,
				admin: true,	
			});
			newUser.save().then(user => {
				const newProfile = new Profile({ 
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					email: req.body.email,
					user: user._id,
					role: req.body.role 
				})
				newProfile.save()
				.then(profile => {
					res.json({profile})
				})
				.catch(err => {console.log('failed to save new profile', err)})
			}).catch(err => {console.log('ailed to save new userf', err)})
		}
	})
	
	})

//Get the Info for the current User
// not needed here
router.get('/current_user', 
	passport.authenticate('jwt', {session: false}), 
	(req, res) => {
		res.json(req.user)
});
router.get('/',
	(req, res) => {
		res.json(req.user)
	});

//Get the profile info for the current user
router.get('/current_profile', 
	passport.authenticate('jwt', {session: false}), 
	(req, res) => {
		Profile.findOne({
				'user': req.user._id
			})
			.then(profile => {
				if (!profile) {
					//res.json({noprofile: 'No profile found'})
				}
				res.json(profile);
			})
			.catch(err =>
				res.status(404).json({
					profile: err

				})
			);
})


//creates a user and a player profile // mayb this should be in the profile route
//req.params.player will decide the role on the profile, ass/coach, graduate ass, trainer, manager
//for now, all the other roles are gonna be added through register coach
router.post('/profile/new/player', 
//passport.authenticate('jwt', {session: false}), 	
(req, res) => {

	// if(!req.user.admin){ //only admin can add profiles that create a users
	// 	res.json({nono: 'you are under arrest'})
	// }
	//the user have to have a bethel email, what about players that are not yet bethel
	//should be in the validation
	const errors = {};

	User.findOne({email: req.body.email}) 
	.then( user => {
		if (user) {
			errors.email = 'Email already exists'; //no problem because is to the coach
			return res.status(400).json(errors); // i will see what to do here
		} else {
			const newUser = new User({
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: req.body.email,
				//initial password = firstName + BU19
				password: `${req.body.firstName}BU19`
			}); 
			newUser.save()
			.then(user => {
				const newProfile = {
					...req.body, // filter this first and make propriate validations
					user: user._id,
					role: 'player'
				}
				Profile.create(newProfile, (err, profile) => {
					if (err) {
						console.log(err)
					} else {
						res.json(profile)
					}
				})
			})
			.catch(err => console.log(err));


		}
	});
});

router.post('/login', (req, res) => {
	const {
		errors,
		isValid
	} = validateLoginInput(req.body);

	// Check Validation
	if (!isValid) {
		return res.status(400).json(errors);
	}

	const email = req.body.email;
	const password = req.body.password;

	// Find user by email
	User.findOne({email})
	.then(user => {
		if (!user) {
			errors.loginError = 'password and email doesnt Match'; 
			return res.status(404).json(errors);
		}
		// Check Password
		bcrypt.compare(password, user.password).then( isMatch => {
			if (isMatch) {
				// User Matched (he/she is looged in)
				//create jwt payload
				console.log(user.admin)
				const payload = { isAdmin: user.admin, id: user._id, }
				const secretOrKey = process.env.SECRET; 
				jwt.sign(
					payload, 
					secretOrKey, 
					{expiresIn: 3600}, //3600 means an hour, its in seconds, see how to refresh it
					(err, token)=>{
						res.json({
							success: true,
							token: `Bearer ${token}`
						})
					}
				);
				
			} else {
				errors.loginError = 'password and email doesnt Match';
				return res.status(400).json(errors);
			}
		});
	});
});


// update password
// Email sending will be done later future
router.post('/update_password',
	passport.authenticate('jwt', {session: false}),
	(req, res) => {

		const {errors, isValid} = validateUpdatePW(req.body);

		// Check Validation
		if (!isValid) {
			return res.status(400).json(errors);
		}
		User.findById(req.user._id)
		.then(user => {
			bcrypt.compare(req.body.oldPassword, user.password).then( isMatch => {
				if(isMatch) {
					user.password = req.body.newPassword
					user.save()
					.then(user => {
						res.json({success: 'password successfully updated'})
					})
					.catch(err => {
						errors[err.name] = err.message
						res.status(400).json(errors)
					})
					
				}else{
					errors.notMatch = ' invalid Password did not Match' //try a better respond
					res.status(400).json(errors)
				}
			})	
		})
		.catch(err =>{
			errors.userNotFound = ' Error finding user' //doubth u will gwt here
			res.status(400).json(errors)
		})
	});

//forgot password coming soon	
router.get('/forget password', async (req, res) => {
	res.json({comingsoon: 'not yet implemented'})
});


//module.exports = router;
//delete the rest below this.

//make a quote
router.post('/quote/new', (req, res) => {
	//res.json({})
	//console.log(req.body);
	Quote.create(req.body, (err,game)=>{
		if (err) {
			console.log(err)
		} else {
			res.json(game)
		}
	})
}); 

router.get('/announcementTest', async (req, res) => {
	const announcement = await Announcement.find();
	res.json(announcement)
})
//post Announcement and it can only be done by a coach or admin
router.post('/announcement', (req, res) => {
	//res.json({})
	//find the logged in user
	//add it to the creator of this announcement
	//later u can add images
	Announcement.create(req.body, (err, announcement) => {
		if (err) {
			console.log(err)
		} else {
			res.json(announcement)
		}
	})


}); 

module.exports = router;


