const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const studentsSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    class: { type: Schema.Types.ObjectId, ref: 'Class' },
    student: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Student', studentsSchema);
