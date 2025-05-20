import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentReturn.css";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function PaymentReturn() {
  const [orderReference, setOrderReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState(""); // Add email state
  const [cartItems, setCartItems] = useState([]);
  const [products] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedReference = localStorage.getItem("orderReference");
    const storedPhone = localStorage.getItem("phoneNumber");
    const storedName = localStorage.getItem("buyerName");
    const storedEmail = localStorage.getItem("email"); // Get email from storage
    const storedCart = localStorage.getItem("cartItems");

    if (storedReference) setOrderReference(storedReference);
    if (storedPhone) setPhoneNumber(storedPhone);
    if (storedName) setBuyerName(storedName);
    if (storedEmail) setEmail(storedEmail); // Set email

    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      setCartItems(parsedCart);

      const now = new Date().toISOString();

      // Add orderReference and datePurchased to each ticket
      const updatedCart = parsedCart.map(item =>
        item.category === "lek" && item.type === "ticket"
          ? { ...item, orderReference: storedReference, datePurchased: now }
          : item
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));

      // Only add the new order if it doesn't already exist
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const alreadyExists = storedOrders.some(
        o => o.orderReference === storedReference
      );
      if (!alreadyExists) {
        const newOrder = {
          orderReference: storedReference || "",
          buyerName: storedName || "",
          phoneNumber: storedPhone || "",
          email: storedEmail || "",
          datePurchased: now,
          items: updatedCart,
          totalPrice: updatedCart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        };
        localStorage.setItem("orders", JSON.stringify([newOrder, ...storedOrders]));
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("Not logged in, skipping Firestore order save.");
        return;
      }

      const storedReference = localStorage.getItem("orderReference");
      const storedPhone = localStorage.getItem("phoneNumber");
      const storedName = localStorage.getItem("buyerName");
      const storedEmail = localStorage.getItem("email");
      const storedCart = localStorage.getItem("cartItems");

      if (storedCart && storedReference) {
        const parsedCart = JSON.parse(storedCart);
        const now = new Date().toISOString();

        const newOrder = {
          orderReference: storedReference,
          buyerName: storedName || "",
          phoneNumber: storedPhone || "",
          email: storedEmail || "",
          datePurchased: now,
          items: parsedCart,
          totalPrice: parsedCart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        };

        try {
          const userDocRef = doc(db, "users", user.email.toLowerCase());
          const userDocSnap = await getDoc(userDocRef);
          const allOrders = userDocSnap.exists() ? userDocSnap.data().allOrders || [] : [];

          // Check for duplicate orderReference
          const alreadyExists = allOrders.some(
            (order) => order.orderReference === newOrder.orderReference
          );

          if (!alreadyExists) {
            await updateDoc(userDocRef, {
              allOrders: arrayUnion(newOrder)
            });
            console.log("Order added to allOrders array!");
          } else {
            console.log("Order with this reference already exists, not adding duplicate.");
          }
        } catch (err) {
          console.error("Failed to add order to allOrders array:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Format duration: under 60 = minutes, 60 or more = hours (with decimals)
  function formatDurationFromMinutes(minutes) {
    if (!minutes || minutes <= 0) return "Ukjent varighet";
    if (minutes < 60) return `${minutes} minutter`;
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours} timer` : `${hours.toFixed(1)} timer`;
  }

  // Extract duration in minutes from name if missing

  const tickets = cartItems
    .filter((item) => item.category === "lek" && item.type === "ticket")
    .map((item) => {
      // Find the latest product info
      const product = products.find((p) => p.id === item.productId);
      return {
        ...item,
        duration: product?.duration ?? item.duration, // prefer latest duration
      };
    });

  return (
    <div>
      <div className="global-rectangle">
        <h1 className="global-title">VÅRE PARKER</h1>
      </div>

      <div className="payment-return-container">
        <h1>Takk for din bestilling!</h1>

        <div className="left-align">
          <div>
            <strong>Navn:</strong> <span>{buyerName || "N/A"}</span>
          </div>
          <div>
            <strong>E-post:</strong> <span>{email || "N/A"}</span>
          </div>
          <div>
            <strong>Ordre Referanse:</strong>{" "}
            <span>{orderReference || "N/A"}</span>
          </div>
          <div>
            <strong>Kjøpsdato:</strong>{" "}
            <span>
              {cartItems[0]?.datePurchased
                ? (() => {
                    const d = new Date(cartItems[0].datePurchased);
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = String(d.getFullYear()).slice(-2);
                    const hour = String(d.getHours()).padStart(2, "0");
                    const min = String(d.getMinutes()).padStart(2, "0");
                    return `${day}.${month}.${year} kl.${hour}:${min}`;
                  })()
                : "Ukjent"}
            </span>
          </div>
          <div>
            <strong>Telefonnummer:</strong> <span>{phoneNumber || "N/A"}</span>
          </div>
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

          {tickets.length > 0 && (
            <div className="ticket-box" style={{ marginTop: 24 }}>
              <h2>Dine Billetter:</h2>
              <ul>
                {tickets.map((ticket, idx) => (
                  <li key={idx}>
                    <strong>
                      {ticket.quantity}x {ticket.name}
                    </strong>{" "}
                    – Gyldig i {formatDurationFromMinutes(ticket.duration)}
                  </li>
                ))}
              </ul>
              <button
                className="show-tickets-btn"
                style={{ marginTop: 20 }}
                onClick={() => navigate("/tickets")}
              >
                Vis mine billetter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
