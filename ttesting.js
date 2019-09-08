require('dotenv').config();
const createError = require('http-errors'),
	express = require("express"),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	logger = require('morgan'),
	session = require('express-session'),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	flash = require("connect-flash"),
	methodOverride = require("method-override"),
	passport = require("passport"),
	nodemailer = require("nodemailer"),
	crypto = require("crypto"),
	////Models
	User = require("./models/User");


const PORT = process.env.PORT || 3000;

// REQUIRING ROUTES
const indexRouter = require("./routes/api/index"); // FROFILE will be done here
const playerRouter = require("./routes/api/player");
const gameRouter = require("./routes/api/game");
const practiceRouter = require("./routes/api/practice");
const announcementRouter = require("./routes/api/announcement");
const quoteRouter = require('./routes/api/quote');

//expo server sdk for push notificatio
const { Expo } = require('expo-server-sdk');
let expo = new Expo();
//let savedPushTokens = {};
// mongo model User tokens

// user : []
// token : String

// let savedPushTokens = ['ExponentPushToken[97tPyKNxN3JKnyrR9Y6Hj-]', 'ExponentPushToken[OO3KSuFV28ex9R_yPc7iog]'];
// const saveToken = (token) => {
//   if ( savedPushTokens.indexOf(token) === -1 ) {
//     console.log('saving')
//     savedPushTokens.push(token);
//   }
//   console.log(savedPushTokens)
// }

// const handlePushTokens = (message) => {
//   let notifications = [];
//   for (let pushToken of savedPushTokens) {
//     if (!Expo.isExpoPushToken(pushToken)) {
//       console.error(`Push token ${pushToken} is not a valid Expo push token`);
//       continue;
//     }
//     notifications.push({
//       to: pushToken,
//       sound: 'default',
//       title: 'New Practice Added',
//       body: message,
//       data: { message }
//     })
//   }

//   let chunks = expo.chunkPushNotifications(notifications);
//   (async () => {
//     for (let chunk of chunks) {
//       try {
//         let receipts = await expo.sendPushNotificationsAsync(chunk);
//         console.log(receipts);
//       } catch (error) {
//         console.error(error);
//       }
//     }
//   })();
// }

let savedPushTokens = ['ExponentPushToken[97tPyKNxN3JKnyrR9Y6Hj-]', 'ExponentPushToken[OO3KSuFV28ex9R_yPc7iog]']; //to send to all the users
let savedPushAndUserTokens = {}; // to send to a particular user
const saveToken = (token) => {
	if (savedPushTokens.indexOf(token) === -1) {
		savedPushTokens.push(token);
	}
}
const handlePushTokens = (message) => {
	//check all the push tokens for valid tokens
	savedPushTokens = savedPushTokens.filter(pushToken => Expo.isExpoPushToken(pushToken))

	//create a notification to be sent to all the tokens
	let notifications = [];
	for (let pushToken of savedPushTokens) {
		// Construct a notification
		notifications.push({
			to: pushToken,
			sound: 'default',
			title: 'New Practice Added',
			body: message,
			data: {
				message
			} // some property that will help handle some actions on the app
		})
	}
	 
	let chunks = expo.chunkPushNotifications(notifications);
	let tickets = [];
	let receiptIds = [];
	let deviceTokens = []; //devices/tokens that have success in sending to expo
	let removedIndex = []; //index of the devices/tokens to delete from the saved push tokens
	(async () => { //make the async on the parent function handlepush tokens
		let ticketIndex = 0
		for (let chunk of chunks) { 
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
					ticketIndex ++;
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
	
		//get the token to be deleted from the ticket Error based on the index of all the valid tokens
		removedIndex.forEach(index => {
			tokensToBeDelete.push(savedPushTokens[index])
		});

		//get the tokens to be deleted from the receipt based on the index of device tokens
		//device tokens are the tickets that had an Id to fetch the receipt from APPLE AND GOOGLE
		removeReceiptIndex.forEach(index => {
			tokensToBeDelete.push(deviceTokens[index])
		});

		// remove them from the saved tokens
		savedPushTokens = savedPushTokens.filter(token => {
			return (tokensToBeDelete[token] < -1)
		});

	})();
2

//if you tokens are more than hundred, you have to find a different strategy for the indexing

}













const app = express();
//connecting Locally
//mongoose.connect('mongodb://localhost:27017/bu_soccer', { useNewUrlParser: true });
//connecting to MLab
mongoose.connect(`mongodb://${process.env.DBUSER}:${process.env.DBPW}@ds231207.mlab.com:31207/busoccer`, {
	useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log("we're connected to the database!")
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
	extended: false
})); // change one
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(methodOverride("_method"));
app.use(flash());

//session configure
app.use(session({
	secret: 'anything ah anything',
	resave: false,
	saveUninitialized: true
}))

// configure middleware"
app.use(passport.initialize());

//passport config
require('./config/passport')(passport)


app.use(function (req, res, next) {
	res.locals.currentUser = req.user; // I might use this one
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});
app.get('/', (req, res) => {
	res.json({
		Welcome: 'Kebba Demba'
	})
})

/////////////////////////////////////////////

app.post('/api/token', (req, res) => {
	saveToken(req.body.token.value);
	//console.log(`Received push token, ${req.body.token.value}`);
	res.send(`Received push token, ${req.body.token.value}`);
});

app.post('/api/message', (req, res) => {
	// console.log(`111  Received message, ${req.body.message}`);
	handlePushTokens(req.body.message);
	//console.log(`Received message, ${req.body.message}`);
	res.send(`Received message, ${req.body.message}`);
});
////////////////////////////////////////

// app.post('/', (req, res) => {
//   console.log('posting11')
//   User.find({})
//   .then(users => res.json(users))
//   .catch(err => res.json(err))
// })


//mount routes
app.use("/api", indexRouter);
app.use("/api/player", playerRouter);
app.use("/api/game", gameRouter);
app.use("/api/practice", practiceRouter);
app.use('/api/announcement', announcementRouter);
app.use("/api/quote", quoteRouter);
// app.use("/teacher", teacher);
// app.use("/parent", parent);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	//res.render('error');
	res.json({
		404: 'page not found'
	})
});


app.listen(PORT, () => {
	console.log("Server is running");
});



////////////////////////////
const moment = require('moment')

//console.log( moment().format() )
// console.log(moment("2019-12-12T06:00:00.000Z").fromNow())

// console.log(moment("2019-12-12T06:00:00.000Z").format("MMMM Do YYYY"))

var a = moment("2019-06-14T08:42:02.990Z");
var c = moment().format();
var b = moment('2019-06-14T09:40:00.000Z');
console.log(b.diff(a, 'hours', true))
// pick when its its about .1 difference

//const date1 = moment('2019-07-10T07:14:20.000Z,').format()

const date = moment('2019-06-19T09:00:42.000Z').format('YYYY-MM-DD')
const time = moment('2019-06-10T02:00:42.000Z').format('HH:mm:ss')
const realDate = moment(`${date} ${time}`) //.format()
//console.log(realDate.calendar());

//menmot().calendar();
//console.log(moment(date).calendar());
//console.log(time); 
//console.log(date);
//console.log(realDate.calendar());