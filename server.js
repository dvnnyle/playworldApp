const path = require('path');
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// ✅ CORS middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend.onrender.com', // Replace with actual frontend URL on Render
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.use(express.json());

const {
  VIPPS_CLIENT_ID,
  VIPPS_CLIENT_SECRET,
  VIPPS_SUBSCRIPTION_KEY,
  VIPPS_MERCHANT_SERIAL_NUMBER,
  VIPPS_SYSTEM_NAME,
  VIPPS_SYSTEM_VERSION,
  VIPPS_PLUGIN_NAME,
  VIPPS_PLUGIN_VERSION,
  VIPPS_OAUTH_URL,
  VIPPS_PAYMENT_URL,
} = process.env;

// 🔐 Get Vipps access token
async function getAccessToken() {
  try {
    const response = await axios.post(
      VIPPS_OAUTH_URL,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          client_id: VIPPS_CLIENT_ID,
          client_secret: VIPPS_CLIENT_SECRET,
          'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
          'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Vipps access token:', error.response?.data || error.message);
    throw error;
  }
}

// 💳 Create Vipps payment
app.post('/create-payment', async (req, res) => {
  const { amountValue, phoneNumber, reference, returnUrl, paymentDescription } = req.body;

  try {
    const accessToken = await getAccessToken();

    const paymentPayload = {
      amount: { currency: 'NOK', value: amountValue },
      paymentMethod: { type: 'WALLET' },
      customer: { phoneNumber },
      reference,
      returnUrl,
      userFlow: 'WEB_REDIRECT',
      paymentDescription,
    };

    const idempotencyKey = `order-${Date.now()}`;

    const response = await axios.post(VIPPS_PAYMENT_URL, paymentPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
        'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER,
        'Vipps-System-Name': VIPPS_SYSTEM_NAME,
        'Vipps-System-Version': VIPPS_SYSTEM_VERSION,
        'Vipps-System-Plugin-Name': VIPPS_PLUGIN_NAME,
        'Vipps-System-Plugin-Version': VIPPS_PLUGIN_VERSION,
        'Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('Vipps payment response:', JSON.stringify(response.data, null, 2));

    let vippsRedirectUrl = response.data.url || response.data.redirectUrl;

    if (!vippsRedirectUrl) {
      const token =
        response.data.token ||
        response.data.paymentToken ||
        response.data.data?.token ||
        null;

      if (!token) {
        return res.status(500).json({ error: 'Vipps payment token not found' });
      }

      vippsRedirectUrl = `https://apitest.vipps.no/dwo-api-application/v1/deeplink/vippsgateway?v=2&token=${token}`;
    }

    return res.json({ url: vippsRedirectUrl });
  } catch (error) {
    console.error('Error creating Vipps payment:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to create Vipps payment',
      details: error.response?.data || error.message,
    });
  }
});

// 📦 Serve frontend (React build folder)
app.use(express.static(path.join(__dirname, 'build')));

// 🎯 Catch-all: Serve React index.html for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 🚀 Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
