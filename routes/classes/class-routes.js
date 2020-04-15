const express = require('express');
const router = express.Router();
const uploadCloud = require('../../configs/cloudinary.config');
const User = require('../../models/User.model');
const Class = require('../../models/Class.model');
const Student = require('../../models/Student.model');
const Teacher = require('../../models/Teacher.model')

//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Get current teachers/students all classes
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/', (req, res) => {
  getAllClasses(req.user._id, res)
});
//Get all classes function from users classes list
function getAllClasses(id, res){
  User.findById(id)
  .populate({
    path: 'classes',
    populate: [{ path: 'author'}, { path: 'students', populate: [{ path: 'student'}]}]
  })
    .then(userFromDB => {
      const updatedClasses = userFromDB.classes.map(eachClass => {
        eachClass.author.password = undefined
        eachClass.students = eachClass.students.map(data => {
          data.student.password = undefined
          return data
        })
        return eachClass
      })
      res.status(200).json({ classes: updatedClasses });
    })
    .catch(err => console.log(`Error while getting all classes ${err}`));
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
      getAllClasses(req.user._id, res)
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
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Add student to the class
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post('/add-student', (req, res) => {
  //1.Current user/teacher in session
  const { userId, classId } = req.body;
  Student.create({
    author: req.user._id, //teacher
    class: classId,
    student: userId,
  })
    .then(newStudent => {
      // User.findByIdAndUpdate(
      //   userId,
      //   { $push: { classes: classId } },
      //   { new: true }
      // )
      //   .then(classAddedToStudent => {})
      //   .catch(err =>
      //     console.log(
      //       `Error while adding class to the students classes list ${err}`
      //     )
      //   );
      Class.findByIdAndUpdate(
        classId,
        { $push: { students: newStudent._id } },
        { new: true }
      )
        .then(classUpdated => {

          Student.findById(newStudent._id)
          .populate('student')
          .then(studentFromDB => {
            studentFromDB.student.password = undefined
            res.status(200).json({ studentFromDB });
          })
          .catch(err => console.log(err))
        })
        .catch(err =>
          console.log(
            `Error while adding class to the students classes list ${err}`
          )
        );
    })
    .catch(err => console.log(`Error while creating a new student ${err}`));
});
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Remove student from the class
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post('/remove-student', (req, res,) => {
  const { studentData, classId } = req.body;
  Class.findByIdAndUpdate({_id: classId}, { $pull: { students: studentData._id }}, {new: true} )
  .populate({
    path: 'students',
    populate: [{ path: 'student'}]
  })
    .then(updatedClassFromDB => {

      Student.findByIdAndRemove(studentData._id)
      .then(studentRemoved => {
        const updatedStudents = updatedClassFromDB.students.map(data => {
          data.student.password = undefined
          return data
        })
        res.status(200).json({updatedStudents})
      })
      .catch(err => console.log(`Error while deleting student ${err}`))
    })
    .catch(err =>
      console.log(`Error while getting user students to remove a student ${err}`)
    );
});



module.exports = router;
