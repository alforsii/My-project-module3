const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const classesSchema = new Schema(
  {
    name: String,
    grade: { type: String, default: 'Any'},
    schoolYearStart: {type: String, default: new Date().toString()},
    schoolYearEnd: String,
    path: { type: String, default: '/images/cartoon-kids.jpg'},
    description: { type: String, default: 'You can update description at any time.'},
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    students: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }]},
    // students: { type: [{ type: Schema.Types.ObjectId, ref: 'Student' }] },
    teachers: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }]},
    // subjects: { type: [{ type: Schema.Types.ObjectId, ref: 'Subject' }]},
    classworks: { type: [{ type: Schema.Types.ObjectId, ref: 'Classwork' }]},
    posts: { type: [{ type: Schema.Types.ObjectId, ref: 'Post' }]},
  },
  {
    timestamps: true,
  }
);

module.exports = model('Class', classesSchema);
