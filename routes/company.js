var formidable= require('formidable');
var path = require('path');
var fs = require('fs')

module.exports = (app) =>{
  app.get('/company/create', (req, res) => {
    res.render('company/company', {title: 'Company Registration', user: req.user})
  });

  app.post('/upload', (req, res) => {
    // Create an incoming form object using the new kewword
    var form = new formidable.IncomingForm();
    // Store the data into the folder called uploads to save the file
    form.uploadDir = path.join(__dirname + '../public/uploads');
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



  } )

}