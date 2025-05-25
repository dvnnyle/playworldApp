import React, { useEffect, useState } from "react";
import { createVippsPayment } from "../vipps/vipps";
import "./MyCart.css";

export default function MyCart() {
  const [cartItems, setCartItems] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState(""); // after "47"
  const [buyerName, setBuyerName] = useState(""); // new buyer name state
  const [email, setEmail] = useState(""); // Add this line with your other useState hooks
  const [loading, setLoading] = useState(false);
const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return <div className="empty-cart">Handlekurven er tom.</div>;
  }

  const isValidPhone = (phone) => /^47\d{8}$/.test(phone);

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    val = val.replace(/\D/g, "").slice(0, 8);
    setPhoneNumber(val);
  };

  const handlePayNow = async (e) => {
    e.preventDefault();

    const fullPhoneNumber = "47" + phoneNumber;

    if (!buyerName.trim()) {
      alert("Vennligst skriv inn ditt navn.");
      return;
    }
    if (!email.trim()) {
      alert("Vennligst skriv inn din e-post.");
      return;
    }
    if (!phoneNumber.trim()) {
      alert("Vennligst skriv inn telefonnummeret etter '47'.");
      return;
    }
    if (!isValidPhone(fullPhoneNumber)) {
      alert("Vennligst skriv inn et gyldig norsk telefonnummer som starter med 47");
      return;
    }

    setLoading(true);

    // Generate the payment reference once here
    const reference = Date.now().toString().slice(-8);

    const paymentData = {
      amountValue: totalPrice * 100,
      phoneNumber: fullPhoneNumber,
      buyerName: buyerName.trim(),
      email: email.trim(),
      reference: reference, // pass this unique reference
     returnUrl: `${baseUrl}/PaymentReturn`,
 //returnUrl: "http://localhost:3000/PaymentReturn",
      paymentDescription: `Betaling for ${cartItems.length} varer`,
    };

    try {
      const vippsResponse = await createVippsPayment(paymentData);
      if (vippsResponse?.url) {
        // Store the reference and other info locally to track this payment/order
        localStorage.setItem("orderReference", reference);
        localStorage.setItem("phoneNumber", fullPhoneNumber);
        localStorage.setItem("buyerName", buyerName.trim());
        localStorage.setItem("email", email.trim());

        // Redirect to Vipps payment page
        window.location.href = vippsResponse.url;
      } else {
        alert("Vipps betalings-URL mottatt ikke.");
      }
    } catch (error) {
      alert("Betaling feilet: " + (error.message || error));
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
          <div className="global-rectangle">
        <h1 className="global-title">Handlekurv</h1>
      </div>
      <div className="mycart-wrapper">
        <h1>Sammendrag</h1>
        <ul className="cart-summary-list">
          {cartItems.map((item) => (
            <li key={item.productId} className="cart-summary-item">
              {item.quantity}x {item.name} = {item.price * item.quantity} kr
            </li>
          ))}
        </ul>

        <div className="cart-summary-total">
          <h2>Totalsum: {totalPrice} kr</h2>
        </div>
      </div>

      <form onSubmit={handlePayNow} className="phone-pay-form">
        <label htmlFor="buyerName" className="phone-label">
          Navn:
        </label>
        <input
          type="text"
          id="buyerName"
          className="phone-input"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Ditt navn"
          required
        />

        {/* Add email input field */}
        <label htmlFor="email" className="phone-label">
          E-post:
        </label>
        <input
          type="email"
          id="email"
          className="phone-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="din@email.no"
          required
        />

        <label htmlFor="phone" className="phone-label">
          Telefonnummer for betalingsvarsling:
        </label>
        <div className="phone-input-wrapper">
          <input
            type="tel"
            id="phone"
            className="phone-input"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="12345678"
            required
            maxLength={8}
          />
        </div>

        <button type="submit" className="pay-now-btn" disabled={loading}>
          {loading ? "Behandler..." : "Betal med Vipps"}
        </button>
      </form>
    </>
  );
}
