const { Expo } = require('expo-server-sdk');
let expo = new Expo();

const myFunctions = {}

//let savedPushTokens = ['ExponentPushToken[97tPyKNxN3JKnyrR9Y6Hj-]', 'ExponentPushToken[OO3KSuFV28ex9R_yPc7iog]']; //to send to all the users

let savedPushTokens = [];
let savedPushAndUserTokens = {}; // to send to a particular user


myFunctions.saveToken = (token) => {
	 console.log('saving')
	if (savedPushTokens.indexOf(token) === -1) {
		savedPushTokens.push(token);
		console.log('saved')
	}
}

myFunctions.sendPushTokensToFew = (message, tokens) => {
	//send push notifications to selected few or single device
}

myFunctions.handlePushTokens = (notification) => {
	//check all the push tokens for valid tokens
	savedPushTokens = savedPushTokens.filter(pushToken => Expo.isExpoPushToken(pushToken))
	console.log(savedPushTokens);
	//create a notification to be sent to all the tokens
	let notifications = [];
	for (let pushToken of savedPushTokens) {
		// Construct a notification
		notifications.push({
			to: pushToken,
			sound: 'default',
			title: notification.title,
			body: notification.message,
			// data: { message}, // some property that will help handle some actions on the app
			// _displayInForeground : true,
			// badge: 1, // number
		})
	}

	let chunks = expo.chunkPushNotifications(notifications);
	let tickets = [];
	let receiptIds = [];
	let deviceTokens = []; //devices/tokens that have success in sending to expo
	let removedIndex = []; //index of the devices/tokens to delete from the saved push tokens
	//console.log(chunks)
	(async () => { //make the async on the parent function handlepush tokens
		let ticketIndex = 0
		for (let chunk of chunks) {
			console.log('getting tickets')
			try {
				let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
				tickets.push(...ticketChunk);

				//if the ticket is Ok and there is an Id, add it to the Id Tcket List
				//else, there is an error and no need to get the receipt
				//if there is an error, you dont need the ticketId to get the receipt
				for (let ticket of ticketChunk) {
					if (ticket.status === 'ok' && ticket.id) {
						receiptIds.push(ticket.id);
						deviceTokens.push(savedPushTokens[ticketIndex])

					} else if (ticket.status === 'error') {
						console.error(`There was an error sending a notification: ${ticket.message}`);

						if (ticket.details && receipt.details.error) {

							if (receipt.details.error === 'DeviceNotRegistered') {
								//remove this token from the saved token based on the index of the error
								//delete savedPushTokens[ticketIndex]
								console.log('device not registeredddd')
								//this idexes will be used later to remove the blogged devices or
								//the devices that delete the App
								removedIndex.push(ticketIndex)
								//continue;
								//and its not added to the receipt Ids

							} else if (receipt.details.error === 'AnotherErrorCode') {
								//handle properly accodeing to Error Code
							} else if (receipt.details.error === 'AnotherErrorCode3') {
								//handle properly accodeing to Error Code
							} else if (receipt.details.error === 'AnotherErrorCode3') {
								//handle properly accodeing to Error Code
							}
							console.error(`The error code is ${receipt.details.error}`);
						}


					}
					ticketIndex++;
				}

			} catch (error) {
				//Error in the HTTP request
				console.error(error);
			}
		}

		console.log('IDS')
		console.log(receiptIds)
		console.log('TICKETS')
		console.log(tickets)

		let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
		let receiptIndex = 0;
		let removeReceiptIndex = []; //index of the devices/tokens to remove from device tokens
		for (let chunk of receiptIdChunks) {
			try {
				let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
				// The receipts specify whether Apple or Google successfully received the...
				// notification and information about an error, if one occurred.
				
				console.log('receipts')
				console.log(receipts)
				//receipts returns an ugly json, so it needed a little clean up
				const filteredReceipt = Object.values(receipts)

				for (let receipt of filteredReceipt) {
					if (receipt.status === 'ok') {
						console.log('all is good, receipt')

					} else if (receipt.status === 'error') {
						console.error(`There was an error sending a notification: ${receipt.message}`);
						if (receipt.details && receipt.details.error) {
							console.error(`The error code is ${receipt.details.error}`);
							//Now Handle the Errors as mentioned in the documentation
							if (receipt.details.error === 'DeviceNotRegistered') {
								//remove this token from the saved token based on the index of the error
								//delete savedPushTokens[receiptIndex]
								removeReceiptIndex.push(receiptIndex)

							} else if (receipt.details.error === 'MessageTooBig') {
								//make an alert that will be sent to you, if this Errors occur :)
								console.error({
									name: 'ExpoPushNotification',
									message: 'the total notification payload was too large. On Android and iOS the total payload must be at most 4096 bytes'
								})


							} else if (receipt.details.error === 'MessageRateExceeded') {
								console.error({
									name: 'MessageRateExceeded',
									message: 'you are sending messages too frequently to the given device. Implement exponential backoff and slowly retry sending messages.'
								})

							} else if (receipt.details.error === 'InvalidCredentials') {
								console.error({
									name: 'InvalidCredentials',
									message: 'your push notification credentials for your standalone app are invalid (ex: you may have revoked them). Run expo build:ios -c to regenerate new push notification credentials for iOS.'
								})

							}
						}

					}
					receiptIndex++;
				}
			} catch (error) {
				console.error(error);
			}
		}

		let tokensToBeDelete = []

		//get the token to be deleted from the ticketError based on the index of all the valid tokens
		removedIndex.forEach(index => {
			tokensToBeDelete.push(savedPushTokens[index])
		});

		//get the tokens to be deleted from the receipt based on the index of device tokens
		//device tokens are the tickets that had an Id to fetch the receipt from APPLE AND GOOGLE
		removeReceiptIndex.forEach(index => {
			tokensToBeDelete.push(deviceTokens[index])
		});

		//console.log(savedPushTokens)
		//console.log(deviceTokens)
		// remove them from the saved tokens
		savedPushTokens = savedPushTokens.filter(token => {
			return !tokensToBeDelete.includes(token) 
		});
	})();

}

module.exports = myFunctions;
//module.exports = handlePushTokens;