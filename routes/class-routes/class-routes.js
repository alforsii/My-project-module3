const express = require('express');
const router = express.Router();
const uploadCloud = require('../../configs/cloudinary.config');
const User = require('../../models/User.model');
const Class = require('../../models/Class.model');

//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Get current teachers/students all classes
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/', (req, res) => {
  getAllClasses(req.user._id, req, res)
});
//Get all classes function from users classes list
function getAllClasses(id,req, res){
  User.findById(id)
  .populate({
    path: 'archive',
    populate: [{ path: 'author'}, { path: 'students'}]
  })
  .populate({
    path: 'classes',
    populate: [{ path: 'author'}, { path: 'students'}]
  })
    .then(userFromDB => {
      const updatedClasses = removeUsersPassword(userFromDB.classes, req)
      const updatedArchiveClasses = removeUsersPassword(userFromDB.archive, req)
      res.status(200).json({ classes: updatedClasses, removedClasses: updatedArchiveClasses });
    })
    .catch(err => console.log(`Error while getting all classes ${err}`));
}
//update function - remove/hide users password === undefined
//and filter out current student
function removeUsersPassword(classes, req) {
  return classes.map(eachClass => {
    eachClass.author.password = undefined
    eachClass.students = eachClass.students.map(student => {
      student.password = undefined
      return student
    }).filter(student => student._id.toString() !== req.user._id.toString())
    return eachClass
  })
}

//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Create a class
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post('/create-class', uploadCloud.single('image'), (req, res) => {
  // const { name, grade, schoolYearStart, schoolYearEnd, description } = req.body;
  const { _id } = req.user
  if (!req.file) {
    createNewClass(_id,{ ...req.body, author: _id }, res)
  } else {
    createNewClass(_id,{ ...req.body, path: req.file.url, author: _id,}, res)
  }
});

//Create class function
function createNewClass(userId, classBody , res) {
  Class.create( classBody )
    .then(newlyCreatedClass => { 
      //now update users classes list
      User.findByIdAndUpdate(
        userId,
        {
          $push: {
            classes: newlyCreatedClass._id,
          },
        },
        {
          new: true,
        }
      )
        .then(userClassesUpdated => {
          res.status(200).json({ class: newlyCreatedClass });
        })
        .catch(err =>
          console.log(
            `Error while adding newly created class to the users classes list ${err}`
          )
        );
    })
    .catch(err => console.log(`Error while creating a new Class ${err}`));
}
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Remove a class
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post('/remove-class', (req, res) => {
  const { classId } = req.body;

  User.findByIdAndUpdate(req.user._id,{$pull: {classes: classId}})
  .then(updatedUser => {
    User.findByIdAndUpdate(req.user._id,{$push: {archive: classId}}, {new: true})
    .then(updatedUser => {
      getAllClasses(req.user._id, req, res)
    })
    .catch(err => console.log(`Error while adding class to archive ${err}`))
  })
  .catch(err => console.log(`Error while moving removing class to archive ${err}`))
    // Class.findById(classId)
    //   .then(foundClass => {
    //     //now update users classes list
    //     const { author, students, teachers } = foundClass
    //     Student.deleteMany({ _id: { $in: students } })
    //     Teacher.deleteMany({ _id: { $in: teachers } })
    //   })
    //   .catch(err => console.log(`Error while creating a new Class ${err}`));

});




//POST update cover image
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/update/class-image', uploadCloud.single('image'),
    (req, res) => {
      const { classId } =req.body
      Class.findByIdAndUpdate(classId, {
        path: req.file.url,
      })
        .then(classFromDB => {
          res.status(200).json({class: classFromDB});
        })
        .catch(err => res.status(500).json({message: 'Server error'}));
    }
  );


module.exports = router;
