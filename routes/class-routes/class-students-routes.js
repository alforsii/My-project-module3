const express = require('express');
const router = express.Router();
const User = require('../../models/User.model');
const Class = require('../../models/Class.model');
// const Student = require('../../models/Student.model');

//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Get current class students
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/:classId/class-students', (req, res) => {
  const { classId } = req.params;
  Class.findById(classId)
    .populate('author')
    .populate('students')
    .then(classFromDB => {
      const updatedClass = removeUsersPassword([classFromDB], req)[0];
      res.status(200).json({ currentClass: updatedClass });
    })
    .catch(err =>
      console.log(`Error while getting current class students ${err}`)
    );
});

//update function - remove/hide users password === undefined
//and filter out current student
function removeUsersPassword(classes, req) {
  return classes.map(eachClass => {
    eachClass.author.password = undefined;
    eachClass.students = eachClass.students
      .map(student => {
        student.password = undefined;
        return student;
      })
      .filter(student => student._id.toString() !== req.user._id.toString());
    return eachClass;
  });
}

//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Get all other students except current class students
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/:classId/other-students', (req, res) => {
  const { classId } = req.params;
  Class.findById(classId)
    .then(classFromDB => {
      User.find()
      .sort({ firstName: 1 })
        .then(allUsersFromDB => {
          const otherStudents = allUsersFromDB.filter(
            user =>
              user.title === 'Student' &&
              !classFromDB.students.includes(user._id) &&
              user._id.toString() !== req.user._id.toString()
          ).map(user => {
            user.password = undefined
            return user
          })
          res.status(200).json({ students: otherStudents });
        })
        .catch(err => console.log(`Error in DB ${err}`));
    })
    .catch(err =>
      console.log(`Error while getting current class students ${err}`)
    );
});

//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Add student to the class
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post('/add-student', (req, res) => {
  //1.Current user/teacher in session - only teachers have authority to add or remove
  const { userId, classId } = req.body;
  //just in case checking if class does not have the same student already.
  Class.findById(classId)
    .then(classFromDB => {
      //if not found then add new student to the class
      if (classFromDB.students.indexOf(userId) === -1) {
        Class.findByIdAndUpdate(
          classId,
          { $push: { students: userId } },
          { new: true }
        )
          .then(classUpdated => {
            //here just in case checking if user/student does not have the same class.
            User.findById(userId)
              .then(userFromDB => {
                // if not then add class to the students class list.
                if (userFromDB.classes.indexOf(classId) === -1) {
                  User.findByIdAndUpdate(
                    userId,
                    { $push: { classes: classId } },
                    { new: true }
                  )
                    .then(updatedStudentFromDB => {
                      updatedStudentFromDB.password = undefined
                      res
                        .status(200)
                        .json({ studentFromDB: updatedStudentFromDB });
                    })
                    .catch(err =>
                      console.log(
                        `Error while adding classId to the student classes list ${err}`
                      )
                    );
                }
              })
              .catch(err => console.log(err));
          })
          .catch(err =>
            console.log(
              `Error while adding the student to the class students list ${err}`
            )
          );
      }
    })
    .catch(err => console.log(err));
});

//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Remove student from the class
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post('/remove-student', (req, res) => {
  const { studentData, classId } = req.body;
  Class.findByIdAndUpdate(
    { _id: classId },
    { $pull: { students: studentData._id } },
    { new: true }
  )
    .populate('students')
    .then(updatedClassFromDB => {
      const updatedStudents = updatedClassFromDB.students.map(student => {
        student.password = undefined;
        return student;
      });
      res.status(200).json({ updatedStudents });
    })
    .catch(err =>
      console.log(
        `Error while getting class students to remove a student ${err}`
      )
    );
});

module.exports = router;
