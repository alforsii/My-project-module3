require('dotenv').config()
const router = require('express').Router()
const nodemailer = require('nodemailer');

const creds = require('../../configs/auth-user/user.config');

//
let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: creds.USER,
    pass: creds.PASS,
  },
});
/* GET home page */
router.get('/send-email', (req, res, next) => {
    res.render('index');
  });
  
  router.post('/send-email', (req, res, next) => {
    let { email, subject, message } = req.body;
    transporter
      .sendMail({
        from: '"My Awesome Project " <myawesome@project.com>',
        to: email,
        subject: subject,
        text: message,
        html: templates.templateExample(message),
      })
      .then(info => res.render('message', { email, subject, message, info }))
      .catch(error => console.log(error));
  });


  module.exports = router