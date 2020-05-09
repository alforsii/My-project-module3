// const { Router } = require('express');
// const router = new Router();
const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcryptjs = require('bcryptjs')
const saltRounds = 10
const User = require('../../models/User.model')
const routeGuard = require('../../configs/route-guard.configs');


//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
//signup using passport
//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
  // router.post('/signup', (req, res, next) => {
  //   passport.authenticate('local-signup', (err, user, failureDetails) => {
  //     if (err) {
  //       res.status(500).json({ message: 'Something went wrong with database query.' });
  //       return
  //     }
  
  //     if (!user) {
  //       res.status(401).json(failureDetails);
  //       return
  //     }
  
  //     req.login(user, err => {
  //       if (err) return res.status(500).json({ message: 'Something went wrong with login!' });
  //       user.password = undefined;
  //       res.status(200).json({ message: 'Signed up - successful!', user });
  //     });
  //   })(req, res, next);
  // });
  
  //=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
  //signup
  //=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
router.post('/signup', (req, res) => {
  const { username,firstName, lastName, email, password, title } = req.body;

  if (!username || !firstName || !lastName || !email || !password) {
    res.status(401).json({
      message:
        'All fields are mandatory except type field. Please fill out all the inputs and try again!'
    });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(500).json({
      message:
        'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.'
    });
    return;
  }

  User.findOne({email})
  .then(isUserExists => {
  console.log("Output for: isUserExists", isUserExists)
    if(isUserExists){
      res.status(403).json({ message: `User with this email address already registered!`})
      return
    }


  bcryptjs
  .genSalt(saltRounds)
  .then(salt => bcryptjs.hash(password, salt))
  .then(hashedPassword => {
    return User.create({
      username,
      firstName,
      lastName,
      email,
      title,
      password: hashedPassword
    })
      .then(user => {
        
        req.login(user, err => {
          if (err)
            return res
              .status(500)
              .json({ message: 'Successfully signup, but something went wrong with login! Please go to login and try to login. Sorry for inconvenience!' });
          user.password = undefined;
          res.status(200).json({ message: 'Signed up successful!', user });
        });
      })
      .catch(err => {
        if (err instanceof mongoose.Error.ValidationError) {
          res.status(500).json({ message: err.message });
        } else if (err.code === 11000) {
          res.status(500).json({
            message:
              'Username and email need to be unique. Either username or email is already used.'
          });
        } else {
          console.log(err);
        }
      });
  })
  .catch(err => console.log(err));

  })
  .catch(err => {
    res.status(500).json({ message: 'Sorry something went wrong in the server. Please, try later!'})
  })

});

//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
  //login
//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
router.post('/login', (req, res, next) => {
    passport.authenticate('local-login', (err, user, failureDetails) => {
      if (err) {
        res.status(500).json({ message: 'Something went wrong with database query.' });
        return
      }

      if (!user) {
        res.status(401).json(failureDetails);
        return
    }
  
      req.login(user, err => {
        if (err) return res.status(500).json({ message: 'Sorry, something went wrong with login!' });
        user.password = undefined;
        res.status(200).json({ message: 'Login successful!', user });
      });
    })(req, res, next);
  });


// logout
//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
router.post('/logout', routeGuard, (req, res) => {
  const theUser = req.user
    req.logout();
    res.status(200).json({ message: `Logout successful! We gonna miss you ${theUser.firstName}😌! Hope to see you soon, bye!👋` });
  });

// delete user
//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
router.delete('/delete-user/:id', routeGuard, (req, res) => {
    User.findByIdAndDelete(req.params.id)
    .then(deletedUser => {
      res.status(200).json({message: 'User deleted', data: deletedUser})
    })
    .catch(err => res.status(400).json({message: err}))
  });
  
  router.get('/isLoggedIn', (req, res) => {
    if (req.user) {
      req.user.password = undefined;
      res.status(200).json({ user: req.user });
      return;
    }
    res.status(401).json({ message: 'Enter email and password!' });
  });
//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
router.get('/users', (req,res) => {

    User.find()
    .populate({
      path: 'userChatBoards',
      populate: [{path: 'messages', populate: [{path: 'author'}, {path: 'receiverID'}]}]
  })
    .then(users => {
      const filterResFromDB = users.map(user => {
        user.password = undefined
       user.userChatBoards = user.userChatBoards.map(board => {
          board.messages = board.messages.map(message => {
                  message.author.password = undefined
                  message.receiverID.password = undefined
                  return message
              })
                  return board
          })
          return user
      }).filter(user => user._id.toString() !== req.user._id.toString())
        res.status(200).json(filterResFromDB)
    })
    .catch(err => console.log(err))
})

module.exports = router
