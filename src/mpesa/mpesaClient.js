require('dotenv').config();
const axios = require('axios');
const User = require('../database/models/User');
const handleError = require('../middleware/errorHandler');
const { getUnusedAccessCode, markAccessCodeAsUsed, getChatIdOrMpesaNumber } = require('../Utils');
const { isValidPaymentData } = require('../inputValidation');

const getOAuthToken = async () => {
  const consumer_key = process.env.LIPA_NA_MPESA_PASSKEY;
  const consumer_secret = process.env.CONSUMER_SECRET;
  const url = process.env.LIPA_NA_MPESA_URL;

  const buffer = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64');
  const auth = `Basic ${buffer}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': auth
      }
    });

    return response.data.access_token;
  } catch (error) {
    handleError(error);
    throw new Error('Failed to obtain OAuth token');
  }
};

const initiatePayment = async (chatId, tariffValue, callbackUrl) => {
  try {
    const accessToken = await getOAuthToken();
    const auth = `Bearer ${accessToken}`;

    const timestamp = require('../middleware/timestamp').timestamp;
    const url = process.env.LIPA_NA_MPESA_URL;
    const shortCode = process.env.LIPA_NA_MPESA_SHORTCODE;
    const passkey = process.env.LIPA_NA_MPESA_PASSKEY;
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
    const transactionType = 'CustomerPayBillOnline';
    const partyB = shortCode;
    const accountReference = 'lipa-na-mpesa-tutorial';
    const transactionDesc = 'Testing Lipa Na M-Pesa functionality';

    const user = await User.findOne({ chatId });
    const { mpesaNumber: phoneNumber } = await getChatIdOrMpesaNumber(user.phoneNumber);

    const response = await axios.post(url, {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: tariffValue,
      PartyA: phoneNumber,
      PartyB: partyB,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    }, {
      headers: {
        'Authorization': auth
      }
    });

    return response.data;
  } catch (error) {
    handleError(error);
    throw new Error('Failed to initiate M-Pesa payment');
  }
};

const handlePaymentCallback = async (req, res, tariffValue) => {
  const paymentData = req.body;

  try {
    if (!isValidPaymentData(paymentData, tariffValue)) {
      throw new Error('Invalid payment data');
    }

    if (paymentData.success) {
      const [amount, phoneNumber] = paymentData.callbackData.split('|');
      const { chatId } = await getChatIdOrMpesaNumber(phoneNumber);
      const accessCode = await getUnusedAccessCode();

      await markAccessCodeAsUsed(accessCode);
      ctx.telegram.sendMessage(chatId, `Payment successful! Your access code is: ${accessCode}`);
    } else {
      console.error('Error during payment process:', paymentData.errorMessage);
      const { chatId } = await getChatIdOrMpesaNumber(paymentData.phoneNumber);
      await ctx.telegram.sendMessage(chatId, 'A payment processing error has occurred. Please try again later.');
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error in paymentCallbackHandler:', error);
    res.status(500).send('An error occurred. Please try again later.');
  }
};

module.exports = { initiatePayment, handlePaymentCallback };