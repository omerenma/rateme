module.exports = {
  auth: {
    user: 'godwin2341@gmail.com',
    pass: 'kingsly8'
  },
  facebook: {
    clientID: '297400140965673',
    clientSecrete: '01822b79e8711138020b36a01e46f26c',
    profileFields: ['email', 'dispalyName'],
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    passReqToCallback: true
  }
}