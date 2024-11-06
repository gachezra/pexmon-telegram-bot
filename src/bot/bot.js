require('dotenv').config();
const { Telegraf } = require('telegraf');
const Transaction = require('../database/models/Transactions');
const phoneNumberHandler = require('./handlers/phoneNumberHandler');
const welcomeHandler = require('./handlers/welcomeHandler');
const accessCodesHandler = require('./handlers/accessCodeHandler');
const tariffSelectionHandler = require('./handlers/tariffSelectionHandler');
const { markAccessCodeAsUsed, getUnusedAccessCode } = require('../Utils');
const {
  handlePayment,
  handlePaymentCallback,
  confirmPayment,
} = require('./handlers/paymentCallbackHandler');
const {
  instructionHandler,
  registerInstructions,
  buyCodesInstruction,
  viewCodesInstruction
} = require('./handlers/instructionHandler');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Register Telegraf logging middleware
bot.use(Telegraf.log());

bot.start(phoneNumberHandler);
bot.on('text', phoneNumberHandler);

bot.action('home', welcomeHandler);
bot.action('instructions', instructionHandler);
bot.action('registration_instructions', registerInstructions);
bot.action('buy_codes_instructions', buyCodesInstruction);
bot.action('view_access_codes_instructions', viewCodesInstruction);
bot.action('view_access_codes', accessCodesHandler);
bot.action('buy_codes', tariffSelectionHandler);

//initiate payment
bot.action(/buy_\d+/, async (ctx) => {
  const action = { data: ctx.callbackQuery.data };
  await handlePayment(ctx, action);
});

bot.action(/confirm_([^_]+)_([^_]+)_(.+)_(.+)_(.+)/, async (ctx) => {
  const ws = ctx.match[1];
  const co = ctx.match[2];
  const id = ctx.match[3];
  const amount = ctx.match[4];
  const phone = ctx.match[5];
  const CheckoutRequestID = `${ws}_${co}_${id}`; // Concatenates ws, co, and id with underscores
  try {
    console.log('Phone: ', phone)
    const isPaymentConfirmed = await confirmPayment(CheckoutRequestID, ctx);
    if (isPaymentConfirmed) {
      const accessCode = await getUnusedAccessCode(amount);
      await markAccessCodeAsUsed(accessCode, phone);
      // Mark the CheckoutRequestID as used
      await Transaction.updateOne(
        { CheckoutRequestID },
        { $set: { isUsed: true } }
      );
      console.log('Used and code given.')
      await ctx.reply(`Payment successful! Your access code is: ${accessCode}.`);
    } else {
      await ctx.reply('Payment not processed. Please try again or contact support.');
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    
    // Check if the error message includes 'No unused access codes'
    const isNoUnusedCodesError = error.message && error.message.includes('No unused access codes');

    // Customize the error message based on the condition
    const errorMessage = isNoUnusedCodesError
      ? "Wait for more codes to be uploaded."
      : `A payment handling error may have occurred. Please try again later.\n\nExact error: ${error}`;

    await ctx.reply(errorMessage, {
      reply_markup: {
        inline_keyboard: [[{
          text: 'Buy Access Codes',
          callback_data: 'buy_codes'
        }]]
      }
    });
  }
});

// Add this route to handle the M-Pesa callback
bot.use(handlePaymentCallback);

bot.launch().then(() => {
  console.log('Bot started');
}).catch(err => console.error(err));

module.exports = bot;