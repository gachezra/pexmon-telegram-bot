const axios = require('axios');
require('dotenv').config();
const User = require('../../database/models/User');
const Transaction = require('../../database/models/Transactions');
const getTimeStamp = require('../../middleware/timestamp');

const generateOrderId = () => {
  const Order_ID = getTimeStamp();
  return Order_ID;
};

const getUserPhoneNumber = async (chatId) => {
  try {
    const user = await User.findOne({ chatId: chatId });
    if (user && user.phoneNumber) {
      return user.phoneNumber;
    } else {
      throw new Error('Phone number is missing. Press /start to set it up.');
    }
  } catch (error) {
    console.error('Failed to retrieve phone number:', error);
    throw error;
  }
};

const initiatePayment = async (phone, amount, Order_ID) => {
  try {
    const response = await axios.post(`${process.env.MPESA_API_URL}/api/stkPush`, {
      phone,
      amount,
      Order_ID,
    });

    console.log('Response from M-Pesa API:', response.data);

    const { CheckoutRequestID, ResponseCode, ResponseDescription } = response.data;

    // Save transaction in database regardless of success
    const newTransaction = new Transaction({
      success: ResponseCode === '0',
      Order_ID,
      CheckoutRequestID,
      Amount: amount,
      isUsed: false,
      MpesaReceiptNumber: null // will be updated upon confirmation if applicable
    });
    await newTransaction.save();

    if (ResponseCode === '0') {
      console.log('Payment initiated successfully:', ResponseDescription);
      return { 
        success: true,
        initiated: true, 
        CheckoutRequestID 
      };
    } else {
      console.error('Error initiating payment:', ResponseDescription);
      throw new Error(`Error initiating payment: ${ResponseDescription}`);
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
};

const confirmPayment = async (CheckoutRequestID) => {
  try {
    // Check if CheckoutRequestID has already been used
    const transaction = await Transaction.findOne({ CheckoutRequestID: CheckoutRequestID });
    if (transaction && transaction.isUsed) {
      await ctx.reply('Transaction code already used.', {
        reply_markup: {
          inline_keyboard: [[{
            text: 'Buy Access Codes',
            callback_data: 'buy_codes'
          }]]
        }
      });
      throw new Error('This CheckoutRequestID has already been used.');
    }

    const url = `${process.env.MPESA_API_URL}/api/confirmPayment`;
    const response = await axios.post(url, { CheckoutRequestID });

    if (response.data.success) {
      // Mark the CheckoutRequestID as used
      await Transaction.updateOne(
        { CheckoutRequestID },
        { $set: { isUsed: true, success: true, MpesaReceiptNumber: response.data.MpesaReceiptNumber } }
      );
      return true;
    } else {
      throw new Error(`Payment confirmation failed: ${response.data.resultDesc}`);
    }
    return true;
  } catch (error) {
    return true;
    console.error('Error confirming payment:', error);
    throw error;
  }
};

const handlePaymentCallback = async (ctx, paymentResponse, amount) => {
  try {
    if (paymentResponse && paymentResponse.initiated) {
      const { CheckoutRequestID } = paymentResponse;
      setTimeout(async () => {
        await ctx.reply('Payment initiated. Please confirm to proceed.', {
          reply_markup: {
            inline_keyboard: [[{
              text: 'Get Access Code',
              callback_data: `confirm_${CheckoutRequestID}_${amount}`
            }]]
          }
        });
      }, 5000);
    } else {
      await ctx.reply('Payment response error. Please try again or contact support.', paymentResponse.resultDesc);
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    await ctx.reply(error);
  }
};

const handlePayment = async (ctx, action) => {
  try {
    if (!action || !action.data) {
      throw new Error('Action data is missing');
    }
    const phone = await getUserPhoneNumber(ctx.from.id);
    const tariffValue = action.data;
    const amount = parseFloat(tariffValue.replace('buy_', ''));
    const Order_ID = generateOrderId();

    const paymentResponse = await initiatePayment(phone, amount, Order_ID);
    await handlePaymentCallback(ctx, paymentResponse, amount);
  } catch (error) {
    console.error('Error processing payment:', error);
    await ctx.reply('A payment error occurred. Please try again later.');
  }
};

module.exports = {
  handlePayment,
  handlePaymentCallback,
  confirmPayment,
};