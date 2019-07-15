const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const AnnouncementSchema = new Schema({
	subject: { // premade subjects of common ones like meetings
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
	//if messaged is read by the players
	//user can comment under an announcement
},{timestamps: true});

module.exports = mongoose.model('Announcement', AnnouncementSchema);