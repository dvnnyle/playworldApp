//old productpage become cart


import React, { useState } from 'react';
import { createVippsPayment } from './vipps/vipps';

export default function ProductPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(false);

  const product = {
    id: 'sock123',
    name: 'One pair of socks',
    price: 1000, // in øre, so 10 NOK
    currency: 'NOK',
  };

  const handleAddToCart = () => setAddedToCart(true);

  const handlePay = async () => {
    if (!phoneNumber.match(/^47\d{8}$/)) {
      alert('Please enter a valid Norwegian phone number starting with 47');
      return;
    }

    setLoading(true);

    const paymentData = {
      amountValue: product.price,
      phoneNumber,
      reference: `order-${Date.now()}`,  // Unique reference is important
      returnUrl: 'http://localhost:3000/payment-return',
      paymentDescription: product.name,
    };

    try {
      const vippsResponse = await createVippsPayment(paymentData);
      console.log('Vipps response:', vippsResponse);

      if (vippsResponse?.url) {
        window.open(vippsResponse.url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Vipps payment URL not received in the response.');
      }
    } catch (error) {
      alert('Payment failed: ' + (error.message || error));
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>{product.name}</h2>
      <p>Price: {(product.price / 100).toFixed(2)} {product.currency}</p>

      {!addedToCart ? (
        <button onClick={handleAddToCart} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Add to Cart
        </button>
      ) : (
        <>
          <div style={{ margin: '20px 0' }}>
            <label>
              Phone Number:{' '}
              <input
                type="tel"
                placeholder="47XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ padding: '5px', width: '150px' }}
              />
            </label>
          </div>
          <button onClick={handlePay} style={{ padding: '10px 20px', cursor: 'pointer' }} disabled={loading}>
            {loading ? 'Processing...' : 'Pay with Vipps'}
          </button>
        </>
      )}
    </div>
  );
}
