require('dotenv').config();

const config = {
  botToken: process.env.BOT_TOKEN,
  tariffs: [
    { label: 'Half Day (KES 50)', value: 1 },
    { label: 'Full Day (KES 100)', value: 100 },
    { label: '2 Day Discount (KES 150)', value: 150 },
  ],
};

const tariffConfig = {
  50: 720, // Half day (12 hours) in minutes
  100: 1440, // Full day (24 hours) in minutes
  150: 2880, // 2-day discount (48 hours) in minutes
};

module.exports = {
  config,
  tariffConfig
};