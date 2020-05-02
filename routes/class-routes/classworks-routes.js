const express = require('express');
const router = express.Router();

const User = require('../../models/User.model');
const Class = require('../../models/Class.model');
const Classwork = require('../../models/Classwork.model')



//get all classworks
router.get('/:classId/classworks', (req,res) => {
    const {classId} = req.params
    Class.findById(classId)
    .populate({
        path: 'classworks',
        populate: [{ path: 'students'},{path: 'author'}]
    })
    .then(currClass => {
        const classworks = currClass.classworks.map(classwork => {
            classwork.author.password =undefined
            classwork.students = classwork.students.map(student =>{
                student.password = undefined
                return student
            })
            return classwork
        })
    // console.log("Output for: currClass", classworks)
        res.status(200).json({classworks})
    })
    .catch(err => console.log(`Error while updating class to add new classwork ${err}`))
})
//create classwork
router.post('/:classId/classwork/create', (req,res) => {
    const {classId} = req.params
    console.log("create classwork: req.body", req.body)
    Classwork.create({...req.body, author: req.user._id})
    .then(newClasswork => {
        Class.findByIdAndUpdate(classId, { $push: { classworks: newClasswork._id}}, { new: true })
        .populate('classworks')
        .then(updatedClass => {
            res.status(200).json({classworkFromDB: newClasswork})
        })
        .catch(err => console.log(`Error while updating class to add new classwork ${err}`))
    })
    .catch(err => console.log(`Error while creating classwork ${err}`))
})

module.exports =router