const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const RefreshTokenSchema = new Schema({ 
	// Token: { // this should be a List in the future for users with multiple devices
	// 	type: String,
	// 	required: true
	// },
	tokens: [{
		type: String,
	}],
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	// expiryDate: {
			//90 days from now if not used
	// }
}, {
	timestamps: true
});

module.exports = RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
