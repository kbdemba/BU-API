import Validator from 'validator';
import isEmpty from './is-empty';

// players can not edit certain features of the profile model.
// i.e. jersey number, position, role, stats(in V2), DOB, email, First and second Name
module.exports = function validateProfile(data) {
	//filter the input
	let errors = {};

	// data.firstname = !isEmpty(data.firstname) ? data.name : ''; // this initial state is an empty string;
	// data.DOB = !isEmpty(data.email) ? data.email : ''; // THIS HAS TO BE DATE
	


	if (Validator.isEmpty(data.firstName + ' ')) {
		errors.firstname = 'First Name field is required';
	}
	if (Validator.isEmpty(data.lastName + ' ')) {
		errors.lastName = 'Last Name field is required';
	}
	if (!Validator.isEmail(data.email + '')) {
		errors.email = 'Email is invalid';
	}
	if (Validator.isEmpty(data.email + '')) {
		errors.email = 'Email field is required';
	}
	// if (Validator.isEmpty(data.firstName + ' ')) {
	// 	errors.firstname = 'First Name field is required';
	// }
	// if (Validator.isEmpty(data.lastName + ' ')) {
	// 	errors.lastName = 'Last Name field is required';
	// }
	// if (!Validator.isEmail(data.email + '')) {
	// 	errors.email = 'Email is invalid';
	// }
	// if (Validator.isEmpty(data.email + '')) {
	// 	errors.email = 'Email field is required';
	// }

	return {
		data,
		errors,
		isValid: isEmpty(errors)
	};
};
