const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
/// Naa i dont need this, this can be done in the announcements
// Create Schema
const Game_roster_Schema = new Schema({
	game: {
		type: Schema.Types.ObjectId,
		ref: 'Game'
	},
	players: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Users'
		}
	],
	meet: {
		type: String
	},
	location: {
		type: String
	}
	
},{timestamps: true});

module.exports = mongoose.model('GameRoster', Game_roster_Schema);