const passport = require('passport')
const User = require('../../model/User.model')

passport.serializeUser((loggedInUser, next)=> next(null, loggedInUser._id))

passport.deserializeUser((userInSessionId, next) => {
    User.findById(userInSessionId)
    .then(user => next(null, user))
    .catch(err => console.log(err))
})