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
const saveToken = (token, user='kkeebbaa') => {
  if (savedPushTokens.indexOf(token) === -1) {
    savedPushTokens.push(token);
    //if the user is a key in savedPushAndUserTokens
    if (savedPushAndUserTokens[user]) {
      savedPushAndUserTokens[user].push(token)
    }else{
      //create a key with an empty list
      savedPushAndUserTokens[user] = [];
      //then add the token to that list :)
      savedPushAndUserTokens[user].push(token)
    }
  }
  //console.log(savedPushTokens)
}

const handlePushTokens = (message) => {
  let notifications = [];
  
  //create a notification to be sent to all the tokens
  for (let pushToken of savedPushTokens) {

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a notification
    notifications.push({
      to: pushToken,
      sound: 'default',
      title: 'New Practice Added',
      body: message,
      data: { message } // some property that will help handle some actions on the app
    })
  }
  //////////////////////////////////Start editing here/////////////
  let chunks = expo.chunkPushNotifications(notifications);
  let tickets = [];
  (async () => { //make the async on the parent function handlepush tokens
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        // console.log('printing Tickets')
        // console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
        
      } catch (error) {
        console.error(error);
      }
    }
    // console.log('tickets')
    // console.log(tickets)
  //})();

  let receiptIds = [];
  for (let ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  console.log('IDS')
  console.log(receiptIds)
  console.log('TICKETS')
  console.log(tickets)
  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  //(async () => {
    console.log('herherhehre')
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log('RECEIPTS');
        console.log(receipts);
        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.

        //receipts returns an ugly json
        const filteredReceipt = Object.values(receipts)
        for (let receipt of filteredReceipt) {
          if (receipt.status === 'ok') {
            console.log('all is good, receipt')
            continue;
          } else if (receipt.status === 'error') {
            console.error(`There was an error sending a notification: ${receipt.message}`);
            if (receipt.details && receipt.details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
              // You must handle the errors appropriately.
              console.error(`The error code is ${receipt.details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();





}













const app = express();
//connecting Locally
//mongoose.connect('mongodb://localhost:27017/bu_soccer', { useNewUrlParser: true });
//connecting to MLab
mongoose.connect(`mongodb://${process.env.DBUSER}:${process.env.DBPW}@ds231207.mlab.com:31207/busoccer`, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', ()=> {
  console.log("we're connected to the database!")
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // change one
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


app.use(function(req,res,next){
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

// app.post('/api/token', (req, res) => {
//   saveToken(req.body.token.value);
//   //console.log(`Received push token, ${req.body.token.value}`);
//   res.send(`Received push token, ${req.body.token.value}`);
// });

// app.post('/api/message', (req, res) => { 
//  // console.log(`111  Received message, ${req.body.message}`);
//   handlePushTokens(req.body.message);
//   //console.log(`Received message, ${req.body.message}`);
//   res.send(`Received message, ${req.body.message}`);
// });
////////////////////////////////////////

// app.post('/', (req, res) => {
//   console.log('posting11')
//   User.find({})
//   .then(users => res.json(users))
//   .catch(err => res.json(err))
// })


//mount routes
app.use("/api",indexRouter); 
app.use("/api/player",playerRouter); 
app.use("/api/game", gameRouter); 
app.use("/api/practice", practiceRouter);
app.use('/api/announcement', announcementRouter);
app.use("/api/quote", quoteRouter);
// app.use("/teacher", teacher);
// app.use("/parent", parent);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
  res.json({404: 'page not found'})
});


app.listen(PORT, ()=>{
    console.log("Server is running at ", PORT );
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
const realDate = moment(`${date} ${time}`)//.format()
//console.log(realDate.calendar());

//menmot().calendar();
//console.log(moment(date).calendar());
//console.log(time); 
//console.log(date);
//console.log(realDate.calendar());