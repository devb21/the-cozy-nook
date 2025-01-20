const express = require('express');
const router = express.Router();
const paypalClient = require('../utils/paypalClient'); // Import the PayPal client

const paypal = require('@paypal/checkout-server-sdk');

router.post('/paypal-capture', async (req, res) => {
    const { orderID, payerID } = req.body;

    try {
        // Capture the payment
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});
        
        const capture = await paypalClient.execute(request);
        const captureDetails = capture.result;

        // Handle success: Save order info to your database
        // (Example: Use `captureDetails` to save order data to the database)
        console.log('Capture details:', captureDetails);

        // Respond with success
        res.json({ status: 'success', captureDetails });
    } catch (err) {
        console.error('Error capturing PayPal order:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

module.exports = router;
