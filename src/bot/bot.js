require('dotenv').config();
const { Telegraf } = require('telegraf');
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

bot.action(/confirm_([^_]+)_([^_]+)_(.+)_(.+)/, async (ctx) => {
  const ws = ctx.match[1];
  const co = ctx.match[2];
  const id = ctx.match[3];
  const amount = ctx.match[4];
  const CheckoutRequestID = `${ws}_${co}_${id}`; // Concatenates ws, co, and id with underscores
  try {
    const isPaymentConfirmed = await confirmPayment(CheckoutRequestID);
    if (isPaymentConfirmed) {
      const accessCode = await getUnusedAccessCode(amount);
      await markAccessCodeAsUsed(accessCode);
      await ctx.reply(`Payment successful! Your access code is: ${accessCode}.`);
    } else {
      await ctx.reply('Payment not processed. Please try again or contact support.');
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    const errorMessage = `A payment handling error has occured. Please try again later.
    
Exact ${error}`;
    await ctx.reply(errorMessage);
  }
});

// Add this route to handle the M-Pesa callback
bot.use(handlePaymentCallback);

bot.launch().then(() => {
  console.log('Bot started');
}).catch(err => console.error(err));

module.exports = bot;