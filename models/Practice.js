const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// practice should be uploaded a week before or the sunday before the week
// Create Schema
const PracticeSchema = new Schema({
	message: {
		type: String
	},
	team: {
		type: String //Versity or JV or EveryOne or ALL
	},
	date: {
		type: Date
	},
	time: { 
		type: Date 
	},
	endTime: {
		type: Date,
	},
	dateAndTime: { // helps with filtering
		type: Date,
	},

	location: { //grass field or stadium
		type: String
	},
	trainingGear: {
		top: { // shirt color
			type: String 
		}, 
		short: {
			type: String //short color
		},
		socks: {
			type: String //socks color
		},
	},
	cancelled: {
		type: Boolean,
		default: false
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
	
},{timestamps: true}); // and also the user that updated it

module.exports = mongoose.model('Practice', PracticeSchema);