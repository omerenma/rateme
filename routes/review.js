
var Company = require('../models/company');


module.exports = (app) => {
  app.get('/review/:id', (req, res) => {
    Company.findOne({'_id': req.params.id}, (err, data) => {
      res.render('company/review', {title: 'User Reviews', user: req.user, data:data})
    })
    
  })
}