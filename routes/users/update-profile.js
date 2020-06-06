const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const uploadCloud = require('../../configs/cloudinary.config');
const User = require('../../models/User.model');
const routeGuard = require('../../configs/route-guard.configs');

//POST update profile
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/upload-profile', routeGuard, (req, res) => {
  const { username, firstName, lastName, email, password } = req.body;

  if (!username || !firstName || !lastName || !email || !password) {
    res.status(401).json({
      message:
        'username, firstName, lastName, email and password are mandatory.',
    });
    return;
  }

  // Check password strength
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.status(500).json({
      message:
        'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.',
    });
    return;
  }

  // Before update if email is changed make sure there is no such a email exist in the database,
  // if exist he cannot update to that email(else it will be 2 accounts with the same email)
  // email should be uniq
  if (req.user.email !== email) {
    User.findOne({ email })
      .then((foundUser) => {
        if (foundUser) {
          return res.status(403).json({
            message: `The email you're trying update to is already exists. Please use other email.`,
          });
        }
        updateUserDetails(req, res, req.body);
      })
      .catch((err) =>
        console.log(
          `Error while checking email in DB to update user details ${err}`
        )
      );
  } else {
    updateUserDetails(req, res, req.body);
  }
});

function updateUserDetails(req, res, body) {
  const { password } = body;
  console.log('updateUserDetails -> body', body);
  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      User.findByIdAndUpdate(
        req.user._id,
        {
          ...body,
          password: hashedPassword,
        },
        { new: true }
      ).then((user) => {
        console.log('Output for: user', user);
        res.status(200).json({
          message: 'Thanks! Password successfully updated!',
          user,
        });
      });
    })
    .catch((err) => {
      res.status(500).json({
        message:
          'Sorry, something went wrong in the server while updating password.',
      });
      console.log(err);
    });
}
//POST uploaded photo
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post(
  '/upload-photo',
  routeGuard,
  uploadCloud.single('image'),
  (req, res) => {
    if (!req.file.url) {
      res.status(401).json({
        message: "Did you select right path? Sorry, I can't update you image.",
      });
      return;
    }
    User.findByIdAndUpdate(req.user._id, {
      path: req.file.url,
    })
      .then((userFromDB) => {
        res.status(200).json({ user: userFromDB });
      })
      .catch((err) => res.status(500).json({ message: 'Server error' }));
  }
);
//POST update cover image
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post(
  '/update/dashboard-image',
  routeGuard,
  uploadCloud.single('image'),
  (req, res) => {
    if (!req.file.url) {
      res.status(401).json({
        message:
          "Did you select right path? Sorry, I can't update your dashboard image.",
      });
      return;
    }
    User.findByIdAndUpdate(
      req.user._id,
      {
        dashboardImg: req.file.url,
      },
      { new: true }
    )
      .then((userFromDB) => {
        res.status(200).json({ user: userFromDB });
      })
      .catch((err) => res.status(500).json({ message: 'Server error' }));
  }
);

module.exports = router;
