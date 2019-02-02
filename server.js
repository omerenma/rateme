var express = require('express');
var mongoose  = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var _ = require('underscore');
var moment = require('moment')

var app = express();
require('./config/passport');
require('./secrete/secrete');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/rateme',{useNewUrlParser:true} );
app.use(express.static('public'))

app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(validator());


app.use(session({
  secret: 'Thisismytextkey',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection:mongoose.connection})
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Make the _ var globallay availbale every where in the application
app.locals._ = _;
// Another way is to write a function for _
// var globalVar = (req, res, next) => {
//   res.locals._ = _;
// }
// app.use(globalVar)
app.locals.moment = moment;

// Require router files
require('./routes/users')(app, passport);
require('./routes/company')(app);
require('./routes/review')(app)
 require('./routes/message')(app)

 
app.listen(3000, ()=>{
  console.log('Node server running on port 3000')
});

