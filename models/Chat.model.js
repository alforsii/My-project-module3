const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const chatsSchema = new Schema(
  {
    sender: String,
    receiver: String,
    users: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    newMessages:  {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Message',
        },
      ],
    },
    messages: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Message',
        },
      ],
    },
  },

  {
    timestamps: true,
  }
);

module.exports = model('Chat', chatsSchema);
