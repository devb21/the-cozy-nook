const paypal = require('@paypal/checkout-server-sdk');

// Create an environment
const environment = new paypal.core.SandboxEnvironment('YOUR_CLIENT_ID', 'YOUR_SECRET');
// For production, change to LiveEnvironment:
// const environment = new paypal.core.LiveEnvironment('YOUR_CLIENT_ID', 'YOUR_SECRET');

// Create PayPal HTTP client
const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;
