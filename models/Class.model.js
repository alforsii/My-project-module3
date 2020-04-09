const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const classesSchema = new Schema(
  {
    name: String,
    grade: String,
    path: String,
    students: { type: [{ type: Schema.Types.ObjectId, ref: 'Student' }] },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Class', classesSchema);
