require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
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

// Fetch Vipps access token using OAuth
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

// Endpoint to create Vipps payment
app.post('/create-payment', async (req, res) => {
  const { amountValue, phoneNumber, reference, returnUrl, paymentDescription } = req.body;

  try {
    const accessToken = await getAccessToken();

    const paymentPayload = {
      amount: {
        currency: 'NOK',
        value: amountValue,
      },
      paymentMethod: {
        type: 'WALLET',
      },
      customer: {
        phoneNumber,
      },
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

    // Log full response for debugging
    console.log('Vipps payment response:', JSON.stringify(response.data, null, 2));

    // Try to get redirect URL from response
    let vippsRedirectUrl = response.data.url || response.data.redirectUrl;

    if (!vippsRedirectUrl) {
      // Try extracting token from various fields
      const token =
        response.data.token ||
        response.data.paymentToken ||
        response.data.data?.token ||
        null;

      if (!token) {
        console.warn('Vipps payment token or redirect URL not found in response');
        return res.status(500).json({ error: 'Vipps payment token not found' });
      }

      vippsRedirectUrl = `https://apitest.vipps.no/dwo-api-application/v1/deeplink/vippsgateway?v=2&token=${token}`;
    }

    // Send redirect URL to frontend
    return res.json({ url: vippsRedirectUrl });
  } catch (error) {
    console.error('Error creating Vipps payment:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to create Vipps payment',
      details: error.response?.data || error.message,
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Vipps backend listening on port ${PORT}`);
});
