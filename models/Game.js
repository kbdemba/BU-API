const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ScheduleSchema = new Schema({
	teamName: { //this should be its own model.. team V.2
		type: String,
		required: true
	},
	logoUri: { // this should be in the team model from 'tean Name'.
		type:String, // cloudinary
	},
	teamColor: {
		type: String, //color picker this should be in the team model from 'team name'.
	},
	teamAddress:{ // this will later have state, city etc
		type: String, 
	},
	date: {
		type: Date, //when is the game,
		required: true //untill you put the TBA feature
	},
	time: {
		type: String, 
		required: true
	},
	dateAndTime: { // used to accurately filter the upcoming date
		type: Date
	},
	venue: { // should be isHomeGame and be a boolean
		type: String, //Home or away
		//required: true
	},
	gameAddress: { // your home address or the teams address
		type: String, // this can be done using logic on the 
		 // on the front end of the venue/isHomeGame property
	},
	gameType: { //scrimage, conference, CTournament, nationals, etc(Finals, semi-finals...)
		type: String,
		required: true
	},
	roster: [ // the players travelling or dressing up for this game (18 man squard)
		{
			type: Schema.Types.ObjectId,
			ref: 'Profile' 
		}
	]
},{timestamps: true});


module.exports = mongoose.model('Game', ScheduleSchema);
