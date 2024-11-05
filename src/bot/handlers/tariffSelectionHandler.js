const { config } = require('../config'); // Import configuration

const tariffSelectionHandler = async (ctx) => {
  // await ctx.reply('Not available at the moment. But enjoy the free wifi for now😁👍🏽');
  await ctx.reply('Please select a tariff:', {
    reply_markup: {
      inline_keyboard: config.tariffs.map(tariff => ([{ text: tariff.label, callback_data: `buy_${tariff.value}` }])),
    }
  });
};

module.exports = tariffSelectionHandler;