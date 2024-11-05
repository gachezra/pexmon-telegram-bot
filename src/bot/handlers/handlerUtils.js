const User = require('../../database/models/User');
const { isValidPhoneNumber } = require('../../inputValidation');
const { createInlineKeyboard } = require('../../Utils');
const handleError = require('../../middleware/errorHandler');

const handleNewUser = async (ctx) => {
};

const handleNewUserNoNumber = async (ctx) => {
};


const buttons = [
  { text: 'View Access Codes', callbackData: 'view_access_codes' },
  { text: 'Buy Access Codes', callbackData: 'buy_codes' },
  { text: 'Goto Home', callbackData: 'home' },
];
const inlineKeyboard = createInlineKeyboard(buttons); 

const handleExistingUser = async (ctx, user) => {
  await ctx.reply('Your phone number is already saved.', {
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });
};

const handlePhoneNumber = async (ctx, user, phoneNumber) => {
  if (!phoneNumber) {
    await ctx.reply('Please provide your phone new Mpesa phone number.');
    return;
  }

  const formattedPhoneNumber = formatAndValidatePhoneNumber(phoneNumber);
  if (!formattedPhoneNumber) {
    await ctx.reply('Invalid phone number format. Please send it again.');
    return;
  }

  const updateData = { phoneNumber: formattedPhoneNumber };
  const updatedUser = await User.findOneAndUpdate(
    { chatId: ctx.chat.id },
    { $set: updateData },
    { new: true, upsert: true }
  );

  if (updatedUser) {
    await ctx.reply(`Phone number ${formattedPhoneNumber} successfully added/updated.`, {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  } else {
    await ctx.reply('Failed to update. Press /start to try again.');
  }
};

const formatAndValidatePhoneNumber = (input) => {
  try {
    const phoneNumber = input.replace(/\D/g, '');
    if (!isValidPhoneNumber(phoneNumber)) {
      return null;
    }
    const slicedNumber = phoneNumber.length === 10 ? phoneNumber.slice(1) : phoneNumber.slice(phoneNumber.length - 9);
    return `254${slicedNumber}`;
  } catch (error) {
    handleError('Error formatting phone number:', error);
    return null;
  }
};

module.exports = {
  handleNewUser,
  handleExistingUser,
  handlePhoneNumber,
  formatAndValidatePhoneNumber,
  handleNewUserNoNumber
};