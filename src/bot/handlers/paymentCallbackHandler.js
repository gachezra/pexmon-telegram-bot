const axios = require('axios');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const User = require('../../database/models/User');
const Transaction = require('../../database/models/Transactions');

const generateOrderId = () => {
  const Order_ID = parseInt(uuidv4().replace(/-/g, ''), 16).toString().slice(0, 10);
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
      await Transaction.updateOne({ CheckoutRequestID }, { $set: { isUsed: true } });
      return true;
    } else {
      throw new Error(`Payment confirmation failed: ${response.data.resultDesc}`);
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

const handlePaymentCallback = async (ctx, paymentResponse) => {
  try {
    if (paymentResponse && paymentResponse.initiated) {
      const { CheckoutRequestID } = paymentResponse;
      setTimeout(async () => {
        await ctx.reply('Payment initiated. Please confirm to proceed.', {
          reply_markup: {
            inline_keyboard: [[{
              text: 'Get Access Code',
              callback_data: `confirm_${CheckoutRequestID}`
            }]]
          }
        });
      }, 5000); // Delay of 3000 milliseconds (3 seconds)
    } else {
      await ctx.reply('Payment response error. Please try again or contact support.', paymentResponse.resultDesc);
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    await ctx.reply('A payment handling error occurred. Please try again later.');
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
    await handlePaymentCallback(ctx, paymentResponse);
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