const express = require('express');
const router = express.Router();

const Message = require('../../models/Message.model');
const User = require('../../models/User.model');

router.post('/update-status', (req, res) => {
  const { otherUser } = req.body;
  User.findById(req.user._id)
    .populate({
      path: 'userChatBoards',
      populate: [
        {
          path: 'newMessages',
          populate: [{ path: 'author' }, { path: 'receiverID' }],
        },
      ],
    })
    .then((user) => {
      const boards = user.userChatBoards.filter((board) => {
        return board.users.includes(otherUser.id);
      });

      if (boards.length > 0) {
        //get new messages
        const msgIds = boards[0].newMessages
          .filter(
            (message) =>
              message.author._id.toString() === otherUser.id.toString() &&
              message.new === true
          )
          .map((msg) => msg._id);
        //update all new messages
        if (msgIds.length > 0) {
          Message.updateMany(
            { _id: { $in: msgIds } },
            { $set: { new: false } },
            { new: true }
          )
            .then((resFromDB) => {
              console.log(' resFromDB', resFromDB);
            })
            .catch((err) => console.log(err));
        }
      }
    })
    .catch((err) => console.log(err));
});

module.exports = router;
