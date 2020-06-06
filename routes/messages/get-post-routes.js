const express = require('express');
const router = express.Router();
const Chat = require('../../models/Chat.model');
const Message = require('../../models/Message.model');
const User = require('../../models/User.model');

//get current user boards
//==-=-=-=-=-==-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-==-=-==--=-=-=-
router.get('/boards', (req, res) => {
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
    .then((resFromDB) => {
      const filterResFromDB = resFromDB.userChatBoards.map((board) => {
        board.newMessages = board.newMessages.map((message) => {
          message.author.password = undefined;
          message.receiverID.password = undefined;
          return message;
        });
        return board;
      });
      res.status(200).json(filterResFromDB);
    })
    .catch((err) => console.log(err));
});

//check if current user have a board with random user, if no create one
//==-=-=-=-=-==-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-==-=-==--=-=-=-
router.post('/board', (req, res) => {
  const randomUserId = req.body.id;

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
      const board = user.userChatBoards.filter((board) =>
        board.users.includes(randomUserId)
      );

      if (board.length > 0) {
        //get old messages
        const messages = board[0].messages.map((message) => {
          message.author.password = undefined;
          message.receiverID.password = undefined;
          return message;
        });
        //get new messages
        const newMessages = board[0].newMessages.map((message) => {
          message.author.password = undefined;
          message.receiverID.password = undefined;
          return message;
        });
        //  console.log("Output for: newMessages", newMessages)
        res.status(200).json({ messages, newMessages });
      } else {
        res.status(200).json([]);
      }
    });
});

//update or create new Char board and add new messages to newMessages of each Chat board
//==-=-=-=-=-==-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-
router.post('/add-new-message', (req, res) => {
  const { otherUser, messageInputs } = req.body;
  const { message } = messageInputs;

  //check for email && message inputs
  if (!req.user) {
    res.status(500).json({ message: 'Error in server' });
    return;
  }
  if (!message) {
    res.status(401).json({ message: 'Please type a message to send!' });
    return;
  }

  User.findById(req.user._id)
    .populate('userChatBoards')
    .then((user) => {
      // console.log('Output for: user', user);
      //Ok we populate userBoard to check if any board doesn't have the same receiver id
      //because every board should have only one uniq receiver and one current user.

      const foundChatBoard = user.userChatBoards.filter((board) => {
        return (
          board.users.includes(req.user._id) &&
          board.users.includes(otherUser._id)
        );
      });

      //check if the board already exist, it not then create new Board..
      if (foundChatBoard.length == 0) {
        //1.Create Chat board------------------------------------
        Chat.create({
          users: [user._id, otherUser._id],
          author: user._id,
          sender: user.username,
          receiver: otherUser.username,
          // messages,
        })
          .then((newlyCreatedChatBoard) => {
            //add created board to the userChatBoards list

            //1.My Chat boards update
            User.findByIdAndUpdate(
              user._id,
              {
                $push: {
                  userChatBoards: newlyCreatedChatBoard._id,
                },
              },
              {
                new: true,
              }
            )
              .then((updatedUser) => {
                //   console.log('user updated: ');
              })
              .catch((err) =>
                console.log(`Error while creating userBoard in Chat ${err}`)
              );
            //2.Other User Chat boards update
            User.findByIdAndUpdate(
              otherUser._id,
              {
                $push: {
                  userChatBoards: newlyCreatedChatBoard._id,
                },
              },
              {
                new: true,
              }
            )
              .then((updatedOtherUser) => {
                console.log('otherUser updated: ');
              })
              .catch((err) =>
                console.log(`Error while creating userBoard in Chat ${err}`)
              );

            //2.Create message-------------------------------------
            Message.create({
              ...messageInputs, //the message object
              author: user._id, //author of message
              receiverID: otherUser._id,
              receiver: otherUser.username,
              sender: user.username,
              messageBoard: newlyCreatedChatBoard._id,
            })
              .then((createdMessage) => {
                //   console.log('createdMessage1: ');
                updateChatBoard(res, createdMessage);
                //Push the message id to the newly created board, where it belongs
                //so later we can find particular message by it's created _id.
                Chat.findByIdAndUpdate(
                  newlyCreatedChatBoard._id,
                  {
                    $push: {
                      newMessages: createdMessage._id,
                    }, //pushing new message ref: id -> to Chat board property, which is messages
                  },
                  {
                    new: true,
                  }
                )
                  .then((updatedNewChatBoard) => {
                    //   console.log('updatedNewChatBoard(add message)1: ');
                  })
                  .catch((err) =>
                    console.log(
                      `Error while adding new message to Chat messages ${err}`
                    )
                  );
              })
              .catch((err) =>
                console.log(`Error while creating chart msg ${err}`)
              );
          })
          .catch((err) =>
            console.log(`Error happened while creating Chat board ${err}`)
          );
        //end Chat.create if not found in DB
      } else {
        //if Chat board exists then do next=>-------------
        // foundChatBoard
        //2.Create message-------------------------------------
        Message.create({
          ...messageInputs, //the message object
          author: user._id, //author of message
          receiverID: otherUser._id,
          receiver: otherUser.username,
          sender: user.username,
          messageBoard: foundChatBoard[0]._id,
        })
          .then((createdMessage) => {
            //   console.log('createdMessage2: ');

            updateChatBoard(res, createdMessage); //-----------------------------------------------
            //Push the message id to the existing board, where it belongs
            //so later we can find particular message by it's created _id.
            Chat.findByIdAndUpdate(
              foundChatBoard[0]._id, //we could pass her createdMessage.messageBoard -- it should be the same since we're inside then(response from DB)
              {
                $push: {
                  newMessages: createdMessage._id,
                }, //pushing new message ref: id -> to existing Chat board property - messages, which is in foundChatBoard
              },
              {
                new: true,
              }
            )
              .then((updatedChatBoard) => {
                //   console.log('updatedChatBoard(if exists)2: ');
              })
              .catch((err) =>
                console.log(
                  `Error while adding new message to Chat messages ${err}`
                )
              );
          })
          .catch((err) => console.log(`Error while creating chart msg ${err}`));
      }
      //end else statement
    })
    .catch((err) => console.log(`Error while looking current user ${err}`));

  //end
});

// Helper function to create message
function updateChatBoard(res, createdMessage) {
  // socketIO.emit('updateOutput', data);
  Message.findById(createdMessage._id)
    .populate('author')
    .populate('receiverID')
    .then((newMessage) => {
      //   console.log("newMessage", newMessage)
      newMessage.author.password = undefined;
      newMessage.receiverID.password = undefined;

      res.status(200).json(newMessage);
    })
    .catch((err) => console.log(`Error while Sending updated message ${err}`));
}

module.exports = router;
