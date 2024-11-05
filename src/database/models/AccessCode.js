const mongoose = require('mongoose');
const handleError = require('../../middleware/errorHandler');

try {
  const accessCodeSchema = new mongoose.Schema({
    code: { 
      type: String,
      required: true,
      unique: true 
    },
    isUsed: { 
      type: Boolean, 
      default: false 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    }, 
  });

  const AccessCode = mongoose.model('AccessCode', accessCodeSchema);
  module.exports = AccessCode;
} catch (error) {
  console.log('AccessCode schema error: ', error);
  handleError(error);
}