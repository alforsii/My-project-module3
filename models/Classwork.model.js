const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const classworksSchema = new Schema(
  {
      title: String,
      topic: String,
      schedule: String,
      author: { type: Schema.Types.ObjectId, ref: 'User' },
      currClass: { type: Schema.Types.ObjectId, ref: 'Class' },
      description: { type: String, default: 'You can update description at any time.'},
      comments: { type: [{ type: Schema.Types.ObjectId, ref: 'Message' }]},
      students: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }]},
  },
  {
    timestamps: true,
  }
);

module.exports = model('Classwork', classworksSchema);
