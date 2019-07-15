const moment = require('moment');

//function to get the upccoming events
////dORh means days or Hours.. it could have been better
const functions = {}
functions.getUpcomingEvents = (eventList, dORh, numberOFdORh) => {
	const nextEvents = [];
	const waitingList = [];
	const now = moment().format();
	
	eventList.forEach(event => {
		let eventDate = moment(event.date)
		if (eventDate.diff(now, dORh) < numberOFdORh && eventDate.diff(now, dORh) >= 0) {
			nextEvents.unshift(event)
		} else if (eventDate.diff(now, dORh) >= 0 && nextEvents.length === 0) {
			//it is in order, so if it is not in this
			waitingList.push(event);
			return waitingList;
		}
	})
	return nextEvents;
}
functions.getNextGame = (eventList, dORh, numberOFdORh) => {
	const nextEvents = [];
	const waitingList = [];
	const now = moment().format();

	eventList.forEach(event => {
		let eventDate = moment(event.date)
		if (eventDate.diff(now, dORh) < numberOFdORh && eventDate.diff(now, dORh) >= 0) {
			nextEvents.unshift(event)
		} else if (eventDate.diff(now, dORh) >= 0 && nextEvents.length === 0) {
			//it is in order, so if it is not in this
			waitingList.push(event);
			return waitingList;
		}
	})
	return nextEvents;
}


module.exports = functions; 