require('dotenv').config()
const email = process.env.EMAIL
const pass = process.env.PASS
module.exports = {
    USER: email, 
    PASS: pass
}