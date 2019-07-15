const Validator = require('validator');
const isEmpty = require('./is-empty');
const moment = require('moment');

module.exports = function validateGameInput( data ) {
	//what happen if you try to add something that is not in the model,
	// i think it just ignore it
	
	//let this be done in the validation
	// if (data.vs) game_fields.vs = data.vs;
	// if (data.date) game_fields.date = data.date;
	// if (data.location) game_fields.location = data.location;

	//should this be done on the server side Or Both
	// also if only the date is a formatted date and not empty
	const date = moment(data.date).format('YYYY-MM-DD')
	const time = moment(data.time).format('HH:mm:ss')
	data.dateAndTime = moment(`${date} ${time}`) // used to accurately filter and render the upcoming games 
	

	let errors = {};
	// data.date = !isEmpty(data.date) ? data.date : '';
	// data.time = !isEmpty(data.time) ? data.time : '';
	// data.dateAndTime = !isEmpty(data.dateAndTime) ? data.dateAndTime : '';
	

	if (!Validator.isLength(data.teamName + ' ', {
			min: 3, //because i add an extra character
			max: 31
		})) {
		errors.teamName = 'Team Name must be between 2 and 30 characters';
	}

	if (Validator.isEmpty(data.teamName + ' ')) {
		errors.teamName = 'Team Name is required';
	}

	// if (Validator.isEmpty(data.date)) { if it is date formated and not empty and also same with time, do the addition
	// 	errors.date = 'Game date is required';
	// }

	// if (Validator.isEmpty(data.time)) {
	// 	errors.time = 'Game time is required';
	// }

	// if (Validator.isEmpty(data.dateAndTime)) {
	// 	errors.dateAndTime = 'dateAndTime field is required';
	// }

	if (Validator.isEmpty(data.venue + ' ')) {
		errors.venue = 'Venue is required';
	}

	if (Validator.isEmpty(data.gameType + ' ')) {
		errors.gameType = 'gameType is required';
	}

	

	return {
		data, //or filtered data
		errors,
		isValid: isEmpty(errors)
	};
};

// const {
// 	teamName,
// 	logoUri,
// 	teamColor,
// 	teamAddress,
// 	date,
// 	time,
// 	venue,
// 	gameType,

// } = stateData
// //store them in data
// const data = {
// 	...viewedData,
// 	teamName,
// 	logoUri,
// 	teamColor,
// 	teamAddress, // you dont need it untill you have the Team Model
// 	date,
// 	time,
// 	venue,
// 	gameType,

// }