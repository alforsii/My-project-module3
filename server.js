require('dotenv').config();
require('colors')
const express = require('express');
const path = require('path')
const morgan = require('morgan')
var cors = require('cors')
 

const app = express()

//Cors settings
app.use(cors({
    // origin: ['www.web-side.com', ...]
    "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}))
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

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*') //can restrict
//     res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With', 'Content-Type', 'Accept', 'Authorization')
//     if(req.method === 'OPTIONS') {
//         res.header('Access-Control-Allow-Methods', 'PUT', 'POST', 'PATCH', 'GET', 'DELETE')
//         return res.status(200).json({})
//     }
//     next()
// })

// routes
app.use('/api/auth', require('./routes/auth/auth-routes'))
app.use('/api/', require('./routes/nodemailer/nodemailer'))


module.exports = app;

