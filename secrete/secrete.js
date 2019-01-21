module.exports = {
  auth: {
    user: 'godwin2341@gmail.com',
    pass: 'kingsly8'
  },
  facebook: {
    clientID: '297608590803163',
    clientSecrete: 'a0cdab0568e5be5ab9143f4b814de39e',
    profileFields: ['email', 'dispalyName'],
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    passReqToCallback: true
  }
}