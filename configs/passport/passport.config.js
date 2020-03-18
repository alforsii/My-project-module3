const passport = require('passport')
const mongoose = require('mongoose')
const LocalStrategy = require('passport-local').Strategy
const bcryptjs = require('bcryptjs')
const saltRounds = 10;
const User = require('../../model/User.model')

//Signup
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
        if (!username || !email || !password || !firstName || !lastName) {
        next(null, false, {message: 'All fields are mandatory. Please provide your username, email and password.'})
            return;
        }

     //password validation
    //  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    //     if (!regex.test(password)) {
    //         next(null, false, {message: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.'})

    //     return;
    //     }
        
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
        .catch(err =>{
            if (err instanceof mongoose.Error.ValidationError) {
                res.status(500).json({ message: err.message });
              } else if (err.code === 11000) {
                res.status(500).json({
                  message: 'Username and email need to be unique. Either username or email is already used.'
                });
              } else {
                next(err);
                console.log(`Error while creating new user ${err}`)
              }
        } )
    })
    .catch(err => console.log(`Error while checking new user details for signup ${err}`))
}
))

// Login
//=-=-=-=-=-=-=-=-=-=-=-
passport.use(
    'local-login',
    new LocalStrategy(
      {
        usernameField: 'email'
        // passReqToCallback: true // if we need to use request in the callback we can pass it like this
        // in that case the callback would look like: (req, email, password, next)
      },
      (email, password, next) => {
        User.findOne({ email })
          .then(userFromDB => {
          console.log("userFromDB", userFromDB)
            if (!userFromDB) {
              return next(null, false, { message: 'Incorrect email! 🛬' });
            }
            if (!bcryptjs.compareSync(password, userFromDB.password)) {
              return next(null, false, { message: 'Incorrect password! ❌' });
            }
            return next(null, userFromDB);
          })
          .catch(err => next(err));
      }
    )
  );

