const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

// PREVIOS SCHOOL
//CLASS YEAR, I.E the year the student is starting
const ProfileSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	//should i just populate the users to get the name and email ;)
	firstName: {
		type: String,
		
	},
	lastName: {
		type: String,
	},
	email: {
		type: String,
		
	},
	nickName: { //nickName
		type: String,
	},
	role: {
		type: String,
		required: true,
	},
	DOB: {
		type: String
		//type: Date
	},
	jerseyNo: {
		type: String
	},
	position: {
		type: String
	},
	country: {
		type: String
	},
	homeTown: { // 
		type: String
	},
	classY: { //freshman or junior etc
		type: String
	},
	height: {
		type: String
	},
	weight: {
		type: String
	},
	prefferedFoot: {
		type: String
	},
	bio: { // a few paragraph that the player will write about him self
		type: String
	},
	phone_number: {
		type: String
	},
	social: {
		youtube: {
			type: String
		},
		twitter: {
			type: String
		},
		facebook: {
			type: String
		},
		snapchat: {
			type: String
		},
		instagram: {
			type: String
		}
	}
},{timestamps: true});

module.exports = Profile = mongoose.model('Profile', ProfileSchema);
