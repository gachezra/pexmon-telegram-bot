const mongoose = require('mongoose');
const handleError = require('../../middleware/errorHandler');

try {
  const userSchema = new mongoose.Schema(
    {
      chatId: { type: Number, required: true, unique: true, index: true },
      phoneNumber: { type: String, required: true, index: true },
      accessCodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AccessCode' }],
    },
    {
      timestamp: true,
    }
  );

  const User = mongoose.model('User', userSchema);
  module.exports = User;
} catch (error) {
  console.log('User schema error: ', error);
  handleError(error);
}