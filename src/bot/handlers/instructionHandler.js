const { createInlineKeyboard } = require('../../Utils');
const handleError = require('../../middleware/errorHandler');

const registrationInstructions = `To register or update a phone number, send your M-Pesa number in the correct format (254712345678 or 0712345678 or 0112345678) directly. Once you send me your number, I will save it in my database.

After successful registration, you can proceed to buy access codes or view your existing codes.`;

  const buyAccessCodesInstructions = `To buy access codes, follow these steps:

1. Select the Goto Home ption (or Buy Access Codes below).
2. Select the "Buy Access Codes" option from the menu.
3. Choose a tariff option (Half Day, Full Day, or 2-Day Discount) by clicking the corresponding button.
4. I will initiate an M-Pesa payment request for the selected tariff.
5. Complete the M-Pesa payment on your phone by entering your M-Pesa PIN.
6. Once the payment is successful, I will send you a unique access code.

You can buy more access codes anytime by repeating these steps.`;

  const viewAccessCodesInstructions = `To view your access codes, follow these steps:

1. Select the Goto Home optio (or the View Access Codes option below).
2. Select the "View Access Codes" option from the menu.
3. I will display a list of all the access codes you have purchased and not used yet.

If you don't have any access codes, I will prompt you to buy some first.

Remember, each access code can only be used once. If you need more codes, you can buy them by following the "Buying Access Codes" instructions.`;

const instructionHandler = async (ctx) => {
    try {
      const buttons = [
        { text: 'Registration Instructions', callbackData:'registration_instructions' },
        { text: 'Buy Access Codes', callbackData: 'buy_codes_instructions' },
        { text: 'View Access Codes', callbackData: 'view_access_codes_instructions' },
        { text: 'Goto Home', callbackData: 'home' },
      ];
      const inlineKeyboard = createInlineKeyboard(buttons);

      await ctx.reply('Here are your instructions:', {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      });
    } catch (error) {
        console.log(error);
        handleError(error, ctx);
    }
};
const registerInstructions = async (ctx) => {
    try{
        const buttons = [{ text: 'Goto Home', callbackData: 'home' }];
        const inlineKeyboard = createInlineKeyboard(buttons);
    
        await ctx.reply(registrationInstructions, {
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        });
    }catch (error){
        console.log(error);
        handleError(error, ctx);
    };
};

const buyCodesInstruction = async (ctx) => {
    try{
        const buttons = [
          { text: 'Buy Access Codes', callbackData: 'buy_codes' },
          { text: 'Goto Home', callbackData: 'home' },
        ];
        const inlineKeyboard = createInlineKeyboard(buttons);
    
        await ctx.reply(buyAccessCodesInstructions, {
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        });
    } catch (error){
        console.log(error);
        handleError(error, ctx);
    };
};

const viewCodesInstruction = async (ctx) => {
    try{
        const buttons = [
          { text: 'View Access Codes', callbackData: 'view_access_codes' },
          { text: 'Goto Home', callbackData: 'home' },
        ];
        const inlineKeyboard = createInlineKeyboard(buttons);
    
        await ctx.reply(viewAccessCodesInstructions, {
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        });
    } catch (error){
        console.log(error);
        handleError(error, ctx);
    };
};

module.exports = {
    instructionHandler,
    registerInstructions,
    buyCodesInstruction,
    viewCodesInstruction
};