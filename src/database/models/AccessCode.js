const mongoose = require('mongoose');
const handleError = require('../../middleware/errorHandler');

try {
  const accessCodeSchema = new mongoose.Schema({
    code: { 
      type: String,
      required: true,
      unique: true 
    },
    value: {
      type: Number,
      required: true,
    },
    isUsed: { 
      type: Boolean,
      required: false,
      default: false 
    },
    user: { 
      type: String,
      required: false
    }, 
  });

  const AccessCode = mongoose.model('AccessCode', accessCodeSchema);
  module.exports = AccessCode;
} catch (error) {
  console.log('AccessCode schema error: ', error);
  handleError(error);
}