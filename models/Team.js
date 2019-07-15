const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// i will work on this later
// i dont need it or still you need it because sometimes you play a team more than once
// Create Schema
const TeamSchema = new Schema({
	Name: { 
		type: String,
		required: true
	},
	logo: {
		type: String, // cloudinary
	},
	location: {
		type: String, //Home or away
		required: true
	},
	date: {
		type: Date, //when is the game,
		required: true
	},
	roster: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]
},{timestamps: true});


module.exports = mongoose.model('Team', TeamSchema);
