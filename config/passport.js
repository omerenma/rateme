var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

// Use passport seriaLizeUser to save the user in to sesion
passport.serializeUser((user, done) =>{
    done(null, user.id);
});

// deseriaLizeUser uses the id saved in the session to retrieve the user data in the database
passport.deserializeUser((id, done) =>{
    User.findById(id, (err, user) =>{
      done(err, user)
    });
});
// Use the passport middleware
// Give the middleware a name e.g 'local.signup'
// To make use of the passport we say new Localstrategy({})
// passport makes use of two field i.e usernameField and passwordField

passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  

}, (req, email, password, done ) => {
    User.findOne({'email': email}, (err, user) =>{
      if(err){
        return done(err);
      }
      if(user){
        return done(null, false, req.flash('error', 'Email already exist.'));
      }else{
        var newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);
      }
      newUser.save((err) => {
        return done(null, newUser)
      });
    });
}));

passport.use('local.login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {

  User.findOne({'email':email}, (err, user) => {
      if(err){
          return done(err);
      }
      
      var messages = [];
      
      if(!user || !user.validPassword(password)){
          messages.push('Email Does Not Exist Or Password is Invalid')
          return done(null, false, req.flash('error', messages));
      }
      
      return done(null, user); 
  });
}));