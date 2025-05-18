import React, { useEffect, useState } from "react";
import "./PaymentReturn.css";

export default function PaymentReturn() {
  const [orderReference, setOrderReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [buyerName, setBuyerName] = useState(""); // new state for buyer name
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedReference = localStorage.getItem("orderReference");
    const storedPhone = localStorage.getItem("phoneNumber");
    const storedName = localStorage.getItem("buyerName"); // get saved buyer name
    const storedCart = localStorage.getItem("cartItems");

    if (storedReference) setOrderReference(storedReference);
    if (storedPhone) setPhoneNumber(storedPhone);
    if (storedName) setBuyerName(storedName);
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, []);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

return (
  <div>
    <div className="global-rectangle">
      <h1 className="global-title">VÅRE PARKER</h1>
    </div>

    <div className="payment-return-container">
      <h1>Takk for din bestilling!</h1>

      <div className="left-align">
        <div><strong>Navn:</strong> <span>{buyerName || "N/A"}</span></div>
        <div><strong>Ordre Referanse:</strong> <span>{orderReference || "N/A"}</span></div>
        <div><strong>Telefonnummer:</strong> <span>{phoneNumber || "N/A"}</span></div>
      </div>

      <div className="receipt-box">
        <h2>Ordre Sammendrag:</h2>
        <ul className="order-summary-list">
          {cartItems.map((item) => (
            <li key={item.productId}>
              {item.quantity}x {item.name} = {item.price * item.quantity} kr
            </li>
          ))}
        </ul>
        <p>
          <strong>Total:</strong> {totalPrice} kr
        </p>
      </div>
    </div>
  </div>
);

}
