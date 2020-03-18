require('dotenv').config();
require('colors')
const express = require('express');
const path = require('path')
const morgan = require('morgan')


const app = express()
// connect to database
require('./configs/db.config')
//connect to passport
require('./configs/passport/export-passport')(app)




app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


// routes
app.use('/', require('./routes/auth/auth-routes'))


module.exports = app;

