const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const classesSchema = new Schema(
  {
    name: String,
    grade: String,
    schoolYearStart: String,
    schoolYearEnd: String,
    path: { type: String, default: '/images/school-class.jpg'},
    description: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    students: { type: [{ type: Schema.Types.ObjectId, ref: 'Student' }] },
    teachers: { type: [{ type: Schema.Types.ObjectId, ref: 'Student' }] },
    subjects: { type: [{ type: Schema.Types.ObjectId, ref: 'Subject' },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model('Class', classesSchema);
