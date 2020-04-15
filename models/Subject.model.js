const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const subjectsSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    class: { type: Schema.Types.ObjectId, ref: 'Class' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Subject', subjectsSchema);
