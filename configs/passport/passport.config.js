const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcryptjs = require('bcryptjs')
const User = require('../../model/User.model')

passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true,
},
(req, username, password, next)=> {
    const { firstName, lastName,  email } = req.body
    User.findOne({email})
    .then(user => {
        if(user){
            next(null, false, {message: 'User with this email already registered'})
            return
        }
        
        bcryptjs.hash(password, 10)
        .then(hashedPassword =>{
            return User.create({
                username,
                firstName,
                lastName,
                email,
                password: hashedPassword
            })
        })
        .then(newlyCreatedUser => next(null, newlyCreatedUser))
        .catch(err => console.log(`Error while creating new user ${err}`))
    })
    .catch(err => console.log(`Error while checking new user details for signup ${err}`))
}
))


