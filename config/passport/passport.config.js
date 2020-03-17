const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')

const User = require('../../model/User.model')

passport.use('local', new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: password
}),
(req, email, password, next)=> {
    User
})


