const User = require('../../database/models/User');
const { createInlineKeyboard } = require('../../Utils');

const accessCodesHandler = async (ctx) => {
  const chatId = ctx.chat.id;
  let accessCodes;

  try {
    const user = await User.findOne({ chatId }).populate('accessCodes');

    if (!user) {
      const buttons = [
        { text: 'Buy Access Codes', callbackData: 'buy_codes' },
        { text: 'Goto Home', callbackData: 'home' },
      ];
      const inlineKeyboard = createInlineKeyboard(buttons);

      await ctx.reply('You don\'t have any access codes yet. Click "Buy Access Codes" to purchase.', {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      });
      return;
    }

    accessCodes = user.accessCodes.map(code => code.code);
  } catch (error) {
    console.error('Error fetching access codes:', error);
    await ctx.reply('Error fetching access codes. Please try again later.');
    return;
  }

  if (accessCodes.length === 0) {
    const buttons = [
      { text: 'Buy Access Codes', callbackData: 'buy_codes' },
      { text: 'Goto Home', callbackData: 'home' },
    ];
    const inlineKeyboard = createInlineKeyboard(buttons);

    await ctx.reply('You don\'t have any access codes yet. Click "Buy Access Codes" to purchase.', {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  } else {
    const buttons = [
      { text: 'Buy Access Codes', callbackData: 'buy_codes' },
      { text: 'Goto Home', callbackData: 'home' },
    ];
    const inlineKeyboard = createInlineKeyboard(buttons);

    await ctx.reply(`Your access codes: ${accessCodes.join(', ')}`, {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  }
};

module.exports = accessCodesHandler;