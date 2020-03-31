require('dotenv').config()
const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(x =>{
    console.log(`Connected to DB, name: ${x.connections[0].name}`.blue)
})
.catch(err=> console.log(`Error when connecting to DB ${err}`))