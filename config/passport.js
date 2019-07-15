

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/User');
const secretOrKey = process.env.SECRET; //save this in an environmental constants / the same as the one in the login route 

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretOrKey;

module.exports = passport => {
	passport.use(new JwtStrategy(opts,  (jwt_payload, done) => {
		User.findOne({
			_id: jwt_payload.id
		}, function (err, user) {
			if (err) {
				return done(err, false);
			}
			if (user) {
				return done(null, user);
			} else {
				//No User found, see what to return
				return done(null, false);
				// or you could create a new account
			}
		});
	}));
}