const mongoose = require('mongoose');
const handleError = require('../../middleware/errorHandler');

try {
  const transactionSchema = new mongoose.Schema({
    success: { type: Boolean, required: true },
    Order_ID: { type: String, required: true },
    CheckoutRequestID: { type: String, required: true },
    Amount: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
    MpesaReceiptNumber: { type: String, required: false }
  });
  const Transaction = mongoose.model('Transaction', transactionSchema);
  
  module.exports = Transaction;
} catch (error) {
  console.log('AccessCode schema error: ', error);
  handleError(error);
};


