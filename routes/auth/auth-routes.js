// const { Router } = require('express');
// const router = new Router();
const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcryptjs = require('bcryptjs')
const User = require('../../models/User.model')
const routeGuard = require('../../configs/route-guard.configs');


// router.post('/signup', passport.authenticate('local-signup'), (req,res) => {

    
// })
//signup
//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
// router.post('/signup', (req, res, next) => {
//     passport.authenticate('local-signup', function(err, user, info) {
//     //   req.login(user, function(err) {
//     //     if (err) { return next(err); }
//     //     user.password = undefined
//     //     return res.json(`New user signed up and logged in: ${user}`);
//     //   });
//     req.login(user, err => {
//         if (err) return res.status(500).json({ message: 'Something went wrong with login!' });
//         user.passwordHash = undefined;
//         res.status(200).json({ message: 'Login successful!', user });
//       });

//     })(req, res, next);
//   });

  router.post('/signup', (req, res, next) => {
    passport.authenticate('local-signup', (err, user, failureDetails) => {
      if (err) {
        res.status(500).json({ message: 'Something went wrong with database query.' });
        return
      }
  
      if (!user) {
        res.status(401).json(failureDetails);
        return
      }
  
      req.login(user, err => {
        if (err) return res.status(500).json({ message: 'Something went wrong with login!' });
        user.password = undefined;
        res.status(200).json({ message: 'Login successful!', user });
      });
    })(req, res, next);
  });


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
        if (err) return res.status(500).json({ message: 'Something went wrong with login!' });
        user.password = undefined;
        res.status(200).json({ message: 'Login successful!', user });
      });
    })(req, res, next);
  });


// logout
//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
router.post('/logout', routeGuard, (req, res, next) => {
    req.logout();
    res.status(200).json({ message: 'Logout successful!' });
  });

// delete user
//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
router.delete('/delete-user/:id', routeGuard, (req, res, next) => {
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
    res.status().json({ message: 'You are not logged in!' });
  });
//=-=-=-===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==
router.get('/users', (req,res) => {

    User.find()
    .then(users => res.status(200).json(users))
    .catch(err => console.log(err))
})

module.exports = router
