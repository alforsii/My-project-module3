require('dotenv').config();
require('colors')
const express = require('express');
const path = require('path')
const morgan = require('morgan')
var cors = require('cors')
 
const app = express()
// connect to database
require('./configs/db.config')
//connect to passport
require('./configs/passport/export-passport')(app)

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Cross-Origin Resource Sharing
app.use(
    cors({
         // origin: ['www.web-side.com', 'http://localhost:3000']
      // origin: [process.env.FRONTEND_POINT],
      origin: true,
      credentials: true, // this needs set up on the frontend side as well
      //                   in axios "withCredentials: true"
      //    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//    optionsSuccessStatus: 204,
  //  preflightContinue: false
    })
  );

// routes
app.use('/api/auth', require('./routes/auth/auth-routes'))
app.use('/api/messages', require('./routes/messages/get-post-routes'))
app.use('/api/messages', require('./routes/messages/update-status'))
app.use('/api/profile', require('./routes/users/update-profile'))
app.use(require('./routes/messages/messaging.io'))


module.exports = app;

