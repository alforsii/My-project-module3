const mongoose = require('mongoose')
const { Schema, model } = mongoose

const usersSchema = new Schema({
    username: String,
    email: String,
    password: String
},
{
    timestamps: true
})

module.exports = model('User', usersSchema)