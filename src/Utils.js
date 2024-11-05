const AccessCode = require('./database/models/AccessCode');
const User = require('./database/models/User');
const { isValidPhoneNumber } = require('./inputValidation');

const getUnusedAccessCode = async (amount) => {
  console.log('Value: ', amount)
  const unusedAccessCode = await AccessCode.findOne({ value: amount });
  if (!unusedAccessCode) {
    throw new Error('No unused access codes available');
  }
  return unusedAccessCode.code;
};

const markAccessCodeAsUsed = async (code) => {
  await AccessCode.updateOne({ code }, { isUsed: true });
};

const getChatIdFromPhoneNumber = async (phoneNumber) => {
  const user = await User.findOne({ phoneNumber }); 
  return user.chatId;
};

const getAccessCodes = async (chatId) => {
  const user = await User.find({ chatId: chatId });
  if (user.length === 0) {
    return null;
  }
  return user[0].accessCodes;
};

const getChatIdOrMpesaNumber = async (ctx) => {
  const chatId = ctx.chat.id;
  try {
    const user = await User.findOne({ chatId });
    if (user && user.phoneNumber) {
      return user;
    } else {
      await ctx.reply('Welcome! We couldn\'t find a linked Mpesa phone number. Please enter your Mpesa phone number (in the format 2547712345678) to continue.');
      return new Promise((resolve, reject) => {
        ctx.once('text', async (ctx) => {
          const phoneNumber = ctx.message.text;
          if (!isValidPhoneNumber(phoneNumber)) {
            await ctx.reply('Invalid phone number format. Please try again.');
            reject(new Error('Invalid phone number format'));
          } else {
            const updatedUser = await User.findOneAndUpdate(
              { chatId },
              { $set: { phoneNumber } },
              { upsert: true, new: true }
            );
            resolve(updatedUser);
          }
        });
      });
    }
  } catch (error) {
    console.error('Database operation failed:', error);
    await ctx.reply('A database error occurred. Please try again later.');
  }
};

const createInlineKeyboard = (buttons) => {
  return buttons.map(button => [
    {
      text: button.text,
      callback_data: button.callbackData,
    },
  ]);
};

module.exports = {
  getUnusedAccessCode,
  markAccessCodeAsUsed,
  getChatIdFromPhoneNumber,
  createInlineKeyboard,
  getAccessCodes,
  getChatIdOrMpesaNumber,
};