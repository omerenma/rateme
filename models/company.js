var mongoose = require('mongoose');
var companySchema = mongoose.Schema({
  name: {type: String},
  adress: {type: String},
  city: {type: String},
  country: {type: String},
  website: {type: String},
  image: {type: String},

  // Add array to hold the list of employees of a company
  employees: [{
    employeeId: {type: String, default: ''},
    employeeFullname: {type: String, default: ''},
    employeeRole: {type: String, default: ''}
  }],

// Rating and Reviews for any company
companyRating: [{
  companyName: {type: String, default: ''},
  userFullname: {type: String, default: ''},
  userRole: {type:String, default: ''},
  companyImage: {type: String, default: ''},
  userRating: {type:Number, default: 0},
  userReview: {type:String, default: ''}
}],
ratingNumber: [Number],
ratingSum: {type:Number, default:0}
});

module.exports = mongoose.model('Company', companySchema);