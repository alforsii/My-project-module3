const express = require('express');
const router = express.Router();

// const User = require('../../models/User.model');
const Class = require('../../models/Class.model');
// const Classwork = require('../../models/Classwork.model')
const Post = require('../../models/Post.model') 



//get all posts for current class
//=-=-=-=-=-=--=--=-=-=-=-=-=-=-=-===-=-=-=-=-=-=-=-=
router.get('/:classId/posts', (req,res) => {
    Class.findById(req.params.classId)
    .populate({
        path: 'posts',
        populate: [{path: 'authorPost'}, {path: 'classwork', populate: [{path: 'students'}]}]
    })
    .then(foundClass => {
        let posts
        if(foundClass.posts.length > 0) {
             posts = foundClass.posts.map(post => {
                post.author.password = undefined
                post.classwork.students =  post.classwork.students.map(student => {
                    student.password = undefined
                    return student
                })
                return post
            })
        } else {
            posts = foundClass.posts
        }
        res.status(200).json({ posts })
    })
    .catch(err => console.log(`Error while getting all classroom posts${err}`))
})

//create post for current class
//=-=-=-=-=-=--=--=-=-=-=-=-=-=-=-===-=-=-=-=-=-=-=-=
router.post('/:classId/posts/create', (req,res) => {
    const { classwork } = req.body
   Post.create({
       authorPost: req.user._id,
       currClass: req.params.classId,
       classwork: classwork._id
   }).then(newPost => {
       Class.findByIdAndUpdate(classId, { $push: { posts: newPost._id}}, { new: true })
       .then(updatedClass => {
           req.user.password = undefined
        res.status(200).json({ 
            post: { 
                 author: req.user,
                 currClass: req.params.classId,
                 classwork
                } 
        })
       })
       .catch(err => console.log(`Error while updating classroom posts after creating a new post ${err}`))
   })
   .catch(err => console.log(`Error in server while creating new post ${err}`))
})

module.exports =router