const express = require('express');
const { bot } = require('./bot/bot');
const mongoose = require('./database/mongoose');
require('dotenv').config();


const app = express();

app.use(express.json());

// import routes
const lipaNaMpesaRoutes = require("./mpesa/routes/routes.lipanampesa.js");
app.use('/api', lipaNaMpesaRoutes);

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});