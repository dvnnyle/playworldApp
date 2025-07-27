// vipps.js
//const BACKEND_URL = '';  // empty string means "same origin"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || ''; // your backend URL

export async function createVippsPayment(paymentData) {
  const response = await fetch(`${BACKEND_URL}/create-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      // If response is not JSON, use status text
      error = { error: response.statusText || 'Unknown error' };
    }
    throw new Error(JSON.stringify(error));
  }

  return response.json(); 
}

export async function captureVippsPayment({ reference, amountValue }) {
  const response = await fetch(`${BACKEND_URL}/capture-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reference, amountValue }),
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      // If response is not JSON, use status text
      error = { error: response.statusText || 'Unknown error' };
    }
    throw new Error(JSON.stringify(error));
  }

  return response.json();
}

export async function refundVippsPayment({ reference, amountValue }) {
  const response = await fetch(`${BACKEND_URL}/refund-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reference, amountValue }),
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      // If response is not JSON, use status text
      error = { error: response.statusText || 'Unknown error' };
    }
    throw new Error(JSON.stringify(error));
  }

  return response.json();
}