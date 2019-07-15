const Validator = require('validator');
const isEmpty = require('../is-empty');

module.exports = function validateUpdatePW(data) {
	let errors = {};

	//validator only validates strings
	data.oldPassword = !isEmpty(data.oldPassword) ? data.oldPassword : '';
	data.newPassword = !isEmpty(data.newPassword) ? data.newPassword : '';
	data.confirmPassword = !isEmpty(data.confirmPassword) ? data.confirmPassword : '';

	if (Validator.isEmpty(data.oldPassword)) { //if or (!Validator.isEmail(data.email+ ' ')) and delete the one above
		errors.oldPassword = 'Old Password field is required';
	}
	if (!Validator.isLength(data.oldPassword, {
			min: 6,
			max: 8
		})) {
		errors.oldPassword = 'Password must be between 6 and 8';
	}

	if (Validator.isEmpty(data.newPassword)) {
		errors.newPassword = 'New Password field is required';
	}
	if (!Validator.isLength(data.newPassword, {
			min: 6,
			max: 8
		})) {
		errors.newPassword = 'Password must be between 6 and 8';
	}

	if (Validator.isEmpty(data.confirmPassword)) {
		errors.confirmPassword = 'Confirm Password field is required';
	}
	if (!Validator.equals(data.newPassword, data.confirmPassword)) {
		errors.confirmPassword = 'Passwords must match';
	}

	return {
		errors,
		isValid: isEmpty(errors)
	};
};