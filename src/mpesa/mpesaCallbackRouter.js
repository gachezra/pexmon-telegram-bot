const express = require('express');

const { handlePaymentCallback } = require('./mpesaClient');

const router = express.Router();

router.post('/mpesa-callback', handlePaymentCallback);

module.exports = router;