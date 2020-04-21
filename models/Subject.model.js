const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const subjectsSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Subject', subjectsSchema);
