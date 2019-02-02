
var async = require('async');
var Company = require('../models/company');


module.exports = (app) => {
  app.get('/review/:id', (req, res) => {
    var message = req.flash('success')
    Company.findOne({'_id': req.params.id}, (err, data) => {
      res.render('company/review', {title: 'User Reviews', user: req.user, data:data, msg: message, hasmsg: message.length > 0})
    });
    });

    app.post('/review/:id', (req, res) => {
      // The first function retrieves the company's data using the params with the help of async.waterfall
      // The data is then passed to the next function so the update the user's collection
      async.waterfall([
        function(callback){
          Company.findOne({'_id': req.params.id}, (err, result) => {
              callback(err, result);
          });
        },
        function(result, callback){
          Company.update({
            '_id': req.params.id
          })
        },
        {
          $push: {companyRating:{
            companyName: req.body.sender,
            userFullname: req.user.fullname,
            userRole: req.user.role,
            companyImage: req.user.company.image,
            userRating: req.body.clickedValue,
            userReview: req.body.review

          }, 
          ratingNumber: req.body.clickedValue
        },
        $inc: {ratingSum: req.body.clickedValue}
        }, (err) => {
          req.flash('success', 'Your review has been added');
          res.redirect('/review')
        }
      ]) 
    })
}