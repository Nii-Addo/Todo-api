const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },
    description: {
      type: String,
      minlength: 3,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model('Activity', ActivitySchema);
module.exports = Activity;
