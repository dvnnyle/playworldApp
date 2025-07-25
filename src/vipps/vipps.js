// vipps.js
const BACKEND_URL = '';  // empty string means "same origin"

//const BACKEND_URL = 'http://localhost:4000'; // your backend URL

export async function createVippsPayment(paymentData) {
  const response = await fetch(`${BACKEND_URL}/create-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json(); 
}
