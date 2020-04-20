const express = require('express')
const router = express.Router()
const uploadCloud = require('../../configs/cloudinary.config');
const User = require('../../models/User.model')
const routeGuard = require('../../configs/route-guard.configs');



//POST update profile
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/upload-profile',routeGuard,(req, res) => {
      User.findByIdAndUpdate(req.user._id, req.body)
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
      User.findByIdAndUpdate(req.user._id, {
        dashboardImg: req.file.url,
      })
        .then(userFromDB => {
          res.status(200).json({user: userFromDB});
        })
        .catch(err => res.status(500).json({message: 'Server error'}));
    }
  );

  

module.exports = router