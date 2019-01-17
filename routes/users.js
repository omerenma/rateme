
module.exports = (app, passport) => {
  app.get('/', (req, res, next) =>{
    res.render('index', {title:'Index || RateMe'});
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
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

// Home route
app.get('/home', (req, res)=>{
  res.render('home', {title:'Home  || RateMe'});
});

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