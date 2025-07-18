require('dotenv').config();
const path = require('path');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
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

// Vipps OAuth token
async function getAccessToken() {
  try {
    const response = await axios.post(
      VIPPS_OAUTH_URL,
      {
        client_id: VIPPS_CLIENT_ID,
        client_secret: VIPPS_CLIENT_SECRET,
        grant_type: "client_credentials"
      },
      {
        headers: {
          'Content-Type': 'application/json',
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

// Create payment (autocapture)
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
      autocapture: true,
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

    const vippsResponse = response.data;
    let vippsRedirectUrl = vippsResponse.url || vippsResponse.redirectUrl;
    const pspReference = vippsResponse.pspReference;
    const aggregate = vippsResponse.aggregate || null;

    if (!vippsRedirectUrl) {
      const token =
        vippsResponse.token ||
        vippsResponse.paymentToken ||
        vippsResponse.data?.token ||
        null;
      if (!token) {
        return res.status(500).json({ error: 'Vipps payment token not found' });
      }
      vippsRedirectUrl = `https://api.vipps.no/dwo-api-application/v1/deeplink/vippsgateway?v=2&token=${token}`;
    }

    return res.json({ url: vippsRedirectUrl, reference, pspReference, aggregate });
  } catch (error) {
    console.error('Error creating Vipps payment:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to create Vipps payment',
      details: error.response?.data || error.message,
    });
  }
});

// Manual capture endpoint
app.post('/capture-payment', async (req, res) => {
  const { reference, amountValue } = req.body;
  try {
    const accessToken = await getAccessToken();
    const capturePayload = {
      modificationAmount: { currency: 'NOK', value: amountValue }
    };
    const url = `https://api.vipps.no/epayment/v1/payments/${reference}/capture`;
    const response = await axios.post(
      url,
      capturePayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
          'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER,
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to capture Vipps payment',
      details: error.response?.data || error.message,
    });
  }
});

// Refund endpoint
app.post('/refund-payment', async (req, res) => {
  const { reference, amountValue } = req.body;
  try {
    const accessToken = await getAccessToken();
    const refundPayload = {
      modificationAmount: { currency: 'NOK', value: amountValue }
    };
    const url = `https://api.vipps.no/epayment/v1/payments/${reference}/refund`;
    const response = await axios.post(
      url,
      refundPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Ocp-Apim-Subscription-Key': VIPPS_SUBSCRIPTION_KEY,
          'Merchant-Serial-Number': VIPPS_MERCHANT_SERIAL_NUMBER,
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4(),
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to refund Vipps payment',
      details: error.response?.data || error.message,
    });
  }
});

// Example order status updater (replace with your DB logic)
async function updateOrderStatus(reference, status) {
  // TODO: Replace this with your actual database update logic
  // For demonstration, we'll just log the update:
  console.log(`Order ${reference} status updated to ${status}`);
}

// Webhook endpoint for Vipps events
app.post('/vipps-webhook', async (req, res) => {
  const event = req.body;
  const reference = event.data?.reference;

  switch (event.type) {
    case 'epayments.payment.created.v1':
      await updateOrderStatus(reference, "created");
      break;
    case 'epayments.payment.aborted.v1':
      await updateOrderStatus(reference, "aborted");
      break;
    case 'epayments.payment.expired.v1':
      await updateOrderStatus(reference, "expired");
      break;
    case 'epayments.payment.cancelled.v1':
      await updateOrderStatus(reference, "cancelled");
      break;
    case 'epayments.payment.captured.v1':
      await updateOrderStatus(reference, "captured");
      break;
    case 'epayments.payment.refunded.v1':
      await updateOrderStatus(reference, "refunded");
      break;
    case 'epayments.payment.authorized.v1':
      await updateOrderStatus(reference, "authorized");
      break;
    case 'epayments.payment.terminated.v1':
      await updateOrderStatus(reference, "terminated");
      break;
    default:
      console.log(`Unhandled Vipps event type: ${event.type}`);
  }

  res.status(200).send('Webhook received');
});

// Serve static React build files
app.use(express.static(path.resolve(__dirname, 'build')));
app.get('/*path', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Vipps backend listening on port ${PORT}`);
});
