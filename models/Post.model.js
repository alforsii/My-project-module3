const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const pastsSchema = new Schema(
  {
      authorPost: { type: Schema.Types.ObjectId, ref: 'User' },
      currClass: { type: Schema.Types.ObjectId, ref: 'Class' },
      classwork: { type: Schema.Types.ObjectId, ref: 'Classwork' },
      comments: { type: [{ type: Schema.Types.ObjectId, ref: 'Message' }]},
  },
  {
    timestamps: true,
  }
);

module.exports = model('Post', pastsSchema);
