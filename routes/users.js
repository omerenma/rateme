
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
var crypto = require('crypto');
var User = require('../models/user');
var secrete = require('../secrete/secrete');


module.exports = (app, passport) => {
  app.get('/', (req, res, next) =>{
    if(req.session.cookie.originalMaxAge !== null){
      res.redirect('/home');
  }else{
      res.render('index', {title:'Index || RateMe'});
  }
    });

    // Sign up route
    
    app.get('/signup', (req, res)=>{
      var errors = req.flash('error');
      res.render('user/signup', {title:'Sign Up || RateMe', messages:errors, hasErrors:errors.length > 0 });
    });

    // Sign up Post
    app.post('/signup', validate, passport.authenticate('local.signup', {
      successRedirect: '/home',
      failureRedirect: '/signup',
      failureFlash: true
    }))

    // Login route
    app.get('/login', (req, res)=>{
      var errors = req.flash('error');
      res.render('user/login', {title:'Login  || RateMe', messages: errors, hasErrors: errors.length > 0});
    });

    // Login Post
    // To use the errors function copy the function name 'validate'and paste before passport.authenticate
app.post('/login',validateLogin, passport.authenticate('local.login', {
  //successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  if(req.body.rememberme){
    req.session.cookie.maxAge = 30*24*60*60*1000; // 30 days
  }else {
    req.session.cookie.expires = null;
  }
  res.redirect('/home')
});


// Facebook route
app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}))


// Home route
app.get('/home', (req, res)=>{
  res.render('home', {title:'Home  || RateMe'});
});

// Forgot rout
app.get('/forgot', (req, res) => {
  var errors = req.flash('error');
  var info = req.flash('info');
 res.render('user/forgot', 
 {title: 'Request Password Reset', 
 messages:errors, 
 hasErrors:errors.length > 0, 
 info:info, 
 noErrors:info.length > 0 });
});
// use nodemailer, smtpTransport and async
app.post('/forgot', (req, res, next) => {

  async.waterfall([
    function(callback){
      crypto.randomBytes(20, (err, buf) => {
        // Convert the buf value to string and store in token as a variable
        var token = buf.toString('hex');
        callback(err, token);
      });
    },
    // Pass token as an argument to the next function
    // This is actually a higher order function that accepts other functions as argument
    function(token, callback){
      User.findOne({'email': req.body.email}, (err, user) => {
        if(!user){
          req.flash('error', 'No Account With That  Exist Or Email is Invalid');
          return res.redirect('/forgot');
        }
user.passwordResetToken = token;
user.passwordResetExpires = Date.now() + 60*60*1000;
user.save((err) => {
  callback(err, token, user)
});

      })
    },
    function(token, user, callback){
      // Use nodemailer to send mail to the user
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: secrete.auth.user,
          pass: secrete.auth.pass
        }
      });
      // Content of the email message
      var mailOptions = {
        to: user.email,
        from: 'RateMe '+'<'+secrete.auth.user+'>',
        subject: 'RateMe Application Password Reset Token',
        text: 'You have requested for password reset tokn. \n\n'+
            'Please on the link to complete the process: \n\n'+
            'http://localhost:3000/reset/'+token+'\n\n'
        
      };
      // send mail now using smtpTransport
      smtpTransport.sendMail(mailOptions, (err, response) => {
        req.flash('info', 'A password reset token has been sent to ' +user.email);
        return callback(err, user);
      });
    }
  ], (err) => {
    if(err){
      return next(err);
    }else{
      res.redirect('/forgot');
    }
  });

})
// Reset password route / GET
app.get('/reset/:token', (req, res) => {
        
  User.findOne({passwordResetToken:req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {
      if(!user){
          req.flash('error', 'Password reset token has expired or is invalid. Enter your email to get a new token.');
          return res.redirect('/forgot');
      }
      var errors = req.flash('error');
      var success = req.flash('success');
      
      res.render('user/reset', {title: 'Reset Your Password', messages: errors, hasErrors: errors.length > 0, success:success, noErrors:success.length > 0,});
  });
});

// Reset password route / POST
app.post('/reset/:token', (req, res) => {
  async.waterfall([
      function(callback){
          User.findOne({passwordResetToken:req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {
              if(!user){
                  req.flash('error', 'Password reset token has expired or is invalid. Enter your email to get a new token.');
                  return res.redirect('/forgot');
              }
              
              req.checkBody('password', 'Password is Required').notEmpty();
              req.checkBody('password', 'Password Must Not Be Less Than 5').isLength({min:5});
              req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
              
              var errors = req.validationErrors();
              
              if(req.body.password == req.body.confirmPassword){
                  if(errors){
                      var messages = [];
                      errors.forEach((error) => {
                          messages.push(error.msg)
                      })
                      
                      var errors = req.flash('error');
                      res.redirect('/reset/'+req.params.token);
                  }else{
                      user.password = user.encryptPassword(req.body.password);
                      user.passwordResetToken = undefined;
                      user.passwordResetExpires = undefined;
                      
                      user.save((err) => {
                          req.flash('success', 'Your password has been successfully updated.');
                          callback(err, user);
                      })
                  }
              }else{
                  req.flash('error', 'Password and confirm password are not equal.');
                  res.redirect('/reset/'+req.params.token);
              }
                               
          });
      },
      
      function(user, callback){
          var smtpTransport = nodemailer.createTransport({
              service: 'Gmail',
              auth: {
                  user: secret.auth.username,
                  pass: secret.auth.password
              }
          });
          
          var mailOptions = {
              to: user.email,
              from: 'RateMe '+'<'+secret.auth.user+'>',
              subject: 'Your password Has Been Updated.',
              text: 'This is a confirmation that you updated the password for '+user.email
          };
          
          smtpTransport.sendMail(mailOptions, (err, response) => {
              callback(err, user);
              
              var error = req.flash('error');
              var success = req.flash('success');
              
              res.render('user/reset', {title: 'Reset Your Password', messages: error, hasErrors: error.length > 0, success:success, noErrors:success.length > 0});
          });
      }
  ]);
});

app.get('/logout', (req, res) => {
  // Use the logout method and destroy method provided by passport
  req.logout();
  req.session.destroy(err => {
        res.redirect('/');
    });
})
}

// Validate incoming data field before authenticattion
function validate(req, res, next){
  req.checkBody('fullname', 'Fullname is Required').notEmpty();
  req.checkBody('fullname', 'Fullname Must Not Be Less Than 5').isLength({min:5});
  req.checkBody('email', 'Email is Required').notEmpty();
  req.checkBody('email', 'Email is Invalid').isEmail();
  req.checkBody('password', 'Password is Required').notEmpty();
  req.checkBody('password', 'Password Must Not Be less Than 5').isLength({min:5});
  req.check('password', 'Password Must contain at least 1 Number.').matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/,"i");

  // Get these errors to be displayed to the user
  // If errors, then push the errors into messages 
  // Loop through the errors array and get the error message
  var errors = req.validationErrors();
  if(errors){
    var messages = [];
      errors.forEach((error)=> {
        messages.push(error.msg)
      });
      // Save errors message inside the flash module to display it to the user
      req.flash('error', messages);
      //If errors redirect the user to /signup
      res.redirect('/signup');
  }else{
    // If no errors execute the next callback
    return next();
  }

}

// Validate incoming data field before authenticattion
function validateLogin(req, res, next){
  req.checkBody('email', 'Email is Required').notEmpty();
  req.checkBody('email', 'Email is Invalid').isEmail();
  req.checkBody('password', 'Password is Required').notEmpty();
  req.checkBody('password', 'Password Must Not Be less Than 5').isLength({min:5});
  req.check('password', 'Password Must contain at least 1 Number.').matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/,"i");

  // Get these errors to be displayed to the user
  // If errors, then push the errors into messages 
  // Loop through the errors array and get the error message
  var loginErrors = req.validationErrors();
  if(loginErrors){
    var messages= [];
      loginErrors.forEach((error)=> {
        messages.push(error.msg)
      });
      // Save errors message inside the flash module to display it to the user
      req.flash('error', messages);
      //If errors redirect the user to /signup
      res.redirect('/login');
  }else{
    // If no errors execute the next callback
    return next();
  }

}