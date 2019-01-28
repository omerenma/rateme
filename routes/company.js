var formidable= require('formidable');
var path = require('path');
var fs = require('fs');
var async = require('async');
var User = require('../models/user')
var Company = require('../models/company');



module.exports = (app) =>{
  
  app.get('/company/create', (req, res) => {
    var success = req.flash('success')
    res.render('company/company', {title: 'Company Registration', user: req.user, success:success, noErrors:success.length > 0});
  });
  app.post('/company/create', (req, res) => {
        
    var newCompany = new Company();
    newCompany.name = req.body.name;
    newCompany.address = req.body.address;
    newCompany.city = req.body.city;
    newCompany.country = req.body.country;
    newCompany.sector = req.body.sector;
    newCompany.website = req.body.website;
    newCompany.image = req.body.upload;
    
    newCompany.save((err) => {
        if(err){
            console.log(err);
        }
        
        req.flash('success', 'Company data has been added.');
        res.redirect('/company/create');
    })
});

  app.post('/upload', (req, res) => {
    // Create an incoming form object using the new kewword
    var form = new formidable.IncomingForm();
    // Store the data into the folder called uploads to save the file
    form.uploadDir = path.join(-__dirname, + '../public/uploads');
    //Rename the files so that they can use their original name.
    // because once they are uploaded they will take a different name
    form.on('file', (field, file) =>{
      // To rename the file we use fs.rename
      fs.rename(file.path, path.join(form.uploadDir, file.name));
    });
    // Add error event
    form.on('error', (err) => {
      console.log('An error occured', err);
    });
    // Add end event
    form.on('end', () => {
      console.log('File uploaded successfully')
    });
    //Parse the incoming request containing the data
    form.parse(req);
 });

 app.get('/companies', (req, res) => {
   Company.find({}, (err, result) => {
    res.render('company/companies', {title: 'All Companies', user: req.user, data:result})
    
  });
   });

   app.get('/profile/:id', (req, res) => {
     Company.findOne({'_id': req.params.id}, (err, data)=> {
      res.render('company/profile', {title: 'Company Name---', user:req.user, data:data, id:req.params.id})

     })
   })

   app.get('/company/register/:id', (req, res) => {
     Company.findOne({'_id':req.params.id}, (err, data) => {
      res.render('company/register', {title: 'Company Register Employee', user:req.user, data:data})
     });
  });

// Post route to register a logged in employee
  app.post('/company/register/:id', (req, res, next) => {
    // This callback is to update the company's collection and push the data into the fields as 
 // specified by the the company.js User model
    async.parallel([
        function(callback){
           Company.update({
               '_id': req.params.id,
               'employees.employeeId': {$ne: req.user._id}
           },
           {
                $push: {employees: {employeeId: req.user._id, employeeFullname:req.user.fullname, employeeRole:req.body.role}}
           }, (err, count) => {
               if(err){
                   return next(err);
               }
               callback(err, count);
           });
        },
        
        function(callback){
          // Retrieve the company's data and pass it to the second function using async.waterfall
            async.waterfall([
                function(callback){
                    Company.findOne({'_id': req.params.id}, (err, data) => {
                        callback(err, data);
                    })
                },
          // Pass the data to this second function and find the user registering as an employee and update the field for the role
                function(data, callback){
                    User.findOne({'_id': req.user._id}, (err, result) => {
                        result.role = req.body.role;
                        result.company.name = data.name;
                        result.company.image = data.image;
                        
                        result.save((err) => {
                            res.redirect('/home');
                        });
                    })
                }
            ]);
        }
    ]);
});

  
   

}