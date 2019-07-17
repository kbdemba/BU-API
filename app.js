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



const app = express();
//connecting Locally
//mongoose.connect('mongodb://localhost:27017/bu_soccer', { useNewUrlParser: true });
//connecting to MLab
//mongoose.connect(`mongodb://${process.env.DBUSER}:${process.env.DBPW}@ds231207.mlab.com:31207/busoccer`, { useNewUrlParser: true });
mongoose.connect(`mongodb://kebba:school02@ds231207.mlab.com:31207/busoccer`, {
  useNewUrlParser: true
});

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
  console.log(process.env.DBUSER)
  console.log(process.env.DBPW)
  console.log(process.env.SECRET)
  console.log(process.env.ADMIN_PASSWORD)
  res.json({
    jjj: 'fff'
  })
})

app.post('/', (req, res) => {
  console.log('posting11')
  res.json({
    jjj: 'posted'
  })
  // User.find({})
  // .then(users => res.json(users))
  // .catch(err => res.json(err))
})


//mount routes
app.use("/api",indexRouter); 
app.use("/api/player",playerRouter); 
app.use("/api/game", gameRouter); 
app.use("/api/practice", practiceRouter);
app.use('/api/announcement', announcementRouter);
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
const realDate = moment(`${date} ${time}`)//.format()
//console.log(realDate.calendar());

//menmot().calendar();
//console.log(moment(date).calendar());
//console.log(time); 
//console.log(date);
//console.log(realDate.calendar());