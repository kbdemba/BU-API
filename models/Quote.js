const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
// motivational quotes to be diplayed on the app dashboard
// everyday a new one 
const QuotesSchema = new Schema({
	quote: {
		type: String,
		required: true
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
},{timestamps: true});


module.exports = mongoose.model('Quote', QuotesSchema);