const express = require('express');
const router = express.Router();
const User = require('../../models/User.model');
const Class = require('../../models/Class.model');
const Student = require('../../models/Student.model');

//Get current teachers/students all classes
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/', (req, res) => {
  Class.find({ author: req.user._id })
    .populate('students')
    .populate('author')
    .then(classesFromDB => {
      res.status(200).json({ classes: classesFromDB });
    })
    .catch(err => console.log(`Error while getting all classes ${err}`));
});
//Create a class
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.post('/create-class', (req, res) => {
  const { name, grade } = req.body;
  Class.create({ name, grade, author: req.user._id })
    .then(newlyCreatedClass => {
      //now update users classes list
      User.findByIdAndUpdate(
        req.user._id,
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
});

// Get a single class
//-=-==-=--=-=-=-=-=--=-=-=-=---=-==--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
router.get('/current-class', (req, res) => {
  const { classId } = req.body;
  Class.find({ _id: classId })
    .populate('students')
    .populate('author')
    .then(userClass => {
      res.status(200).json({ class: userClass });
    })
    .catch(err => console.log(`Error while getting user album ${err}`));
});

//Add student to the class
//================================================================
router.post('/add-student', (req, res) => {
  //1.Current user/teacher in session
  const { userId, classId } = req.body;
  Student.create({
    author: req.user._id, //teacher
    class: classId,
    student: userId,
  })
    .then(newStudent => {
      User.findByIdAndUpdate(
        userId,
        { $push: { classes: classId } },
        { new: true }
      )
        .then(classAddedToStudent => {})
        .catch(err =>
          console.log(
            `Error while adding class to the students classes list ${err}`
          )
        );
      Class.findByIdAndUpdate(
        classId,
        { $push: { students: newStudent._id } },
        { new: true }
      )
        .then(classUpdated => {
          res.status(200).json({ class: classUpdated });
        })
        .catch(err =>
          console.log(
            `Error while adding class to the students classes list ${err}`
          )
        );
    })
    .catch(err => console.log(`Error while creating a new student ${err}`));
});

//--------- Add to class/helper function -----------------
//================================================================
function addToClass(newlyCreatedStudent, userId, res) {
  User.findByIdAndUpdate(
    userId,
    {
      $push: {
        classes: newlyCreatedStudent._id,
      },
    },
    {
      new: true,
    }
  )
    .then(updatedUser => {
      console.log('updatedUser: ');
    })
    .catch(err =>
      console.log(`Error while trying to update friends list ${err}`)
    );
}
//Delete Album
//=--=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-==-=-
router.post('/delete-album', (req, res, next) => {
  const { album_id } = req.query;
  //1.get the album (we could delete right away but we want to delete all images that this album has since we're deleting the album there's no use of those images that belong to this album)
  Album.findById(album_id)
    .then(albumFromDB => {
      console.log('albumFromDB: ', albumFromDB);
      //2.Delete all images for this album from Image.model(images collection)from DB
      Image.deleteMany({ _id: { $in: albumFromDB.images } })
        .then(imagesDeleted => {
          console.log(imagesDeleted);
          //3.Now delete Album
          Album.findByIdAndRemove(album_id)
            .then(deletedAlbum => {
              // console.log('deletedAlbum: ', deletedAlbum);
              res.redirect('/posts/photo-albums');
            })
            .catch(err =>
              console.log(
                `Error while deleting Album after all images deleted ${err}`
              )
            );
        })
        .catch(err =>
          console.log(
            `Error while deleting all images before album deletion ${err}`
          )
        );
    })
    .catch(err =>
      console.log(`Error while looking for album for deletion ${err}`)
    );
});

//Delete image from album
//================================================================
router.post('/delete-image', (req, res, next) => {
  const { image_id } = req.query;
  //1.Find image by id and delete
  Image.findByIdAndDelete(image_id)
    .then(deletedImage => {
      //2. Remove the deleted image id from Albums images array in DB
      Album.findOneAndUpdate(
        { _id: deletedImage.album },
        { $pull: { images: deletedImage._id } }
      )
        .then(updatedAlbum => {
          console.log('updated album', updatedAlbum);
          res.redirect(`/posts/album?album_id=${deletedImage.album}`);
        })
        .catch(err =>
          console.log(`Error while updating Album for deleted image ${err}`)
        );
    })
    .catch(err => console.log(`Error while deleting image ${err}`));
});

module.exports = router;
