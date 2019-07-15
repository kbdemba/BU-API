const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({ // I think User should not have first Name and Last Name
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	admin: {
		type: Boolean,
		default: false
	},
	// accType: { [COACH, PLAYER, ASS-COACH, G-ASS, TRAINER]
	// 	type: String,
	// 	default: 'player'
	// }
},{timestamps: true});


UserSchema.pre("save", function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	// bcrypt.hash(this.password, 10, function (err, hash) {
	// 	this.password = hash;
	// 	console.log(hash)
	// 	next();
	// });
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(this.password, salt, (err, hash) => {
			if (err) throw err;
			this.password = hash;
			next()
		});
	});
	 
	
});


module.exports = User = mongoose.model('User', UserSchema);
