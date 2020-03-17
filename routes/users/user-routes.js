const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcryptjs = require('bcryptjs')
const User = require('../../model/User.model')


router.post('/signup', passport.authenticate('local-signup'), (req,res) => {

    res.json(req.user);
})
router.post('/login',  (req,res, next) => {
    const { username, password } = req.body
    console.log("Output for: req.body", req.body)
    User.findOne({username})
    .then( foundUser => {
    console.log("Output for: foundUser", foundUser)
        if(!foundUser){
            res.status(200).json('Incorrect username')
            return
        }

        if(!bcryptjs.compareSync(password, foundUser.password)){
            res.status(401).json('Incorrect password')
            return
        }

        foundUser.password = undefined

        res.json(foundUser);
    })
.catch(err => next(err))
})

router.get('/users', (req,res) => {

    User.find()
    .then(users => res.json(users))
    .catch(err => console.log(err))
})

module.exports = router
