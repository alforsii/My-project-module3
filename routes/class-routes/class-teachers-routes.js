const express = require('express');
const router = express.Router();
const User = require('../../models/User.model');
const Class = require('../../models/Class.model');
// const Teacher = require('../../models/Teacher.model')


//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Get current class teachers ------------------- not done
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/:classId/class-teachers', (req,res) => {
    const { classId } = req.params
    Class.findById(classId)
    .populate('author')
    .populate('teachers')
    .then(classFromDB => {
    // console.log("Output for: classFromDB", classFromDB)
      const updatedClass = removeUsersPassword([classFromDB], req)[0]
      res.status(200).json({ currentClass: updatedClass });
    })
    .catch(err => console.log(`Error while getting current class students ${err}`))
  })


    //update function - remove/hide users password === undefined
//and filter out current student
function removeUsersPassword(classes, req) {
    return classes.map(eachClass => {
      eachClass.author.password = undefined
      eachClass.teachers = eachClass.teachers.map(teacher => {
        teacher.password = undefined
        return teacher
      }).filter(teacher => teacher._id.toString() !== req.user._id.toString())
      return eachClass
    })
  }

  //-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Get all teachers except current class teachers 
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/:classId/other-teachers', (req,res) => {
    const { classId } = req.params

    Class.findById(classId)
    .then(classFromDB => {
      User.find()
      .then(allUsersFromDB => {
        const otherTAs = allUsersFromDB.filter(user => user.title === 'TA' && !classFromDB.teachers.includes(user._id) && user._id.toString() !== req.user._id.toString())
        res.status(200).json({ teachers: otherTAs })
      })
      .catch(err => console.log(`Error in DB ${err}`))
    })
    .catch(err => console.log(`Error while getting current class teachers ${err}`))
  })

  //-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Add teacher to the class 
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post('/add-teacher', (req, res) => {
    //1.Current user/teacher in session - only teachers have authority to add or remove
    const { userId, classId } = req.body;
    //just in case checking if class does not have the same teacher already.
    Class.findById(classId)
      .then(classFromDB => {
        //if not found then add new teacher to the class
        if (classFromDB.teachers.indexOf(userId) === -1) {
          Class.findByIdAndUpdate(
            classId,
            { $push: { teachers: userId } },
            { new: true }
          )
            .then(classUpdated => {
              //here just in case checking if user/teacher does not have the same class.
              User.findById(userId)
                .then(userFromDB => {
                  // if not then add class to the teachers class list.
                  if (userFromDB.classes.indexOf(classId) === -1) {
                    User.findByIdAndUpdate(
                      userId,
                      { $push: { classes: classId } },
                      { new: true }
                    )
                      .then(updatedTeacherFromDB => {
                        res
                          .status(200)
                          .json({ teacherFromDB: updatedTeacherFromDB });
                      })
                      .catch(err =>
                        console.log(
                          `Error while adding classId to the teacher classes list ${err}`
                        )
                      );
                  }
                })
                .catch(err => console.log(err));
            })
            .catch(err =>
              console.log(
                `Error while adding the teacher to the class teachers list ${err}`
              )
            );
        }
      })
      .catch(err => console.log(err));
  });
  
  //-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//Remove teacher from the class 
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post('/remove-teacher', (req, res) => {
    const { teacherData, classId } = req.body;
    Class.findByIdAndUpdate(
      { _id: classId },
      { $pull: { teachers: teacherData._id } },
      { new: true }
    )
      .populate('teachers')
      .then(updatedClassFromDB => {
        const updatedTeachers = updatedClassFromDB.teachers.map(teacher => {
          teacher.password = undefined;
          return teacher;
        });
        res.status(200).json({ updatedTeachers });
      })
      .catch(err =>
        console.log(
          `Error while getting class teachers to remove a teacher ${err}`
        )
      );
  });

module.exports = router