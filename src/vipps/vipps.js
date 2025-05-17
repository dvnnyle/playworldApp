const BACKEND_URL = 'https://playworldapp.onrender.com';

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
