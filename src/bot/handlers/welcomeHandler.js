const { createInlineKeyboard } = require('../../Utils');
const handleError = require('../../middleware/errorHandler');

const welcomeHandler = async (ctx) => {
  try {
    const buttons = [
      { text: 'View Access Codes', callbackData: 'view_access_codes' },
      { text: 'Buy Access Codes', callbackData: 'buy_codes' },
      { text: 'Instructions', callbackData: 'instructions' },
    ];
    const inlineKeyboard = createInlineKeyboard(buttons);

    await ctx.reply('Welcome! What would you like to do?', {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  } catch (error) {
    handleError(error, ctx);
  }
};

module.exports = welcomeHandler;