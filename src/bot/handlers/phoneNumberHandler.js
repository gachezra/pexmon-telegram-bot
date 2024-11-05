const { handleNewUser, handleNewUserNoNumber, handleExistingUser, handlePhoneNumber } = require('./handlerUtils');
const User = require('../../database/models/User');

const phoneNumberHandler = async (ctx) => {
  const chatId = ctx.chat.id;
  const incomingText = ctx.message.text;

  try {
    // Check if the incoming text is /start
    if (incomingText === '/start') {
      await ctx.reply('Welcome to our service! Please enter your phone number.');
      return; // Stop further execution
    } else{
      // Check if the user exists in the database
      const user = await User.findOne({ chatId });
      if (!user) {
        // If user doesn't exist, handle as a new user
        await handleNewUser(ctx);
      } else {
        // User exists, check if phone number is null
        if (!user.phoneNumber) {
          await handleNewUserNoNumber(ctx);
        } else {
          // User exists and has a phone number, handle as an existing user
          await handleExistingUser(ctx, user);
        }
      }
      // Handle the submitted phone number
      const phoneNumber = incomingText
      await handlePhoneNumber(ctx, user, phoneNumber);
    };
  } catch (error) {
    console.error('Session failed:', error);
    await ctx.reply('A session error occurred. Press /start to try again.');
  }
};

module.exports = phoneNumberHandler;