const express = require('express')
const router = express.Router()
const uploadCloud = require('../../configs/cloudinary.config');
const User = require('../../models/User.model')
const routeGuard = require('../../configs/route-guard.configs');



//POST update profile
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/upload-profile',routeGuard,(req, res) => {
  const {firstName,lastName,email,password} = req.body
  if(!firstName || !lastName || !email || !password) {
    res.status(401).json({message: 'First name, last name, email and password are required!'});
    return
  }
      User.findByIdAndUpdate(req.user._id, req.body, {new: true})
        .then(userFromDB => {
        console.log("userFromDB", userFromDB)
          res.status(200).json({user: userFromDB});
        })
        .catch(err => console.log(err));
    }
  );
//POST uploaded photo
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/upload-photo',routeGuard, uploadCloud.single('image'),
    (req, res) => {
      if(!req.file.url) {
        res.status(401).json({message: 'Did you select right path? Sorry, I can\'t update you image.'});
        return
      }
      User.findByIdAndUpdate(req.user._id, {
        path: req.file.url,
      })
        .then(userFromDB => {
          res.status(200).json({user: userFromDB});
        })
        .catch(err => res.status(500).json({message: 'Server error'}));
    }
  );
//POST update cover image
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/update/dashboard-image',routeGuard, uploadCloud.single('image'),
    (req, res) => {
      if(!req.file.url) {
        res.status(401).json({message: 'Did you select right path? Sorry, I can\'t update your dashboard image.'});
        return
      }
      User.findByIdAndUpdate(req.user._id, {
        dashboardImg: req.file.url,
      }, {new: true})
        .then(userFromDB => {
          res.status(200).json({user: userFromDB});
        })
        .catch(err => res.status(500).json({message: 'Server error'}));
    }
  );

  

module.exports = router