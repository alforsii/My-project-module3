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
app.use(cors({
    // origin: ['www.web-side.com', ...]
   origin: true,
   credentials: true,
//    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//    optionsSuccessStatus: 204,
//    preflightContinue: false
}))

//Cors settings
// app.use(cors({
//     // origin: ['www.web-side.com', ...]
//     "origin": true,
//   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//   "preflightContinue": false,
//   "optionsSuccessStatus": 204
// }))

// routes
app.use('/api/auth', require('./routes/auth/auth-routes'))
app.use('/api/messages', require('./routes/messages/messages-routes'))


module.exports = app;

