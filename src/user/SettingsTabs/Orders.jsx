import React, { useEffect, useState } from "react";
import "./Orders.css";
import { db, auth } from "../../firebase";
import { doc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import '../../style/global.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setOrders([]);
        return;
      }
      const userEmail = user.email.toLowerCase();
      const userDocRef = doc(db, "users", userEmail);
      const ordersColRef = collection(userDocRef, "newOrders");
      const querySnapshot = await getDocs(ordersColRef);
      const fetchedOrders = querySnapshot.docs
        .map(doc => doc.data())
        .filter(order => order.items && order.items.length > 0);
      setOrders(fetchedOrders);
    });
    return () => unsubscribe();
  }, []);

  const toggleDropdown = idx => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="orders-container">
      <h1 className="orders-title">Mine Ordrer</h1>
      {orders.length === 0 ? (
        <p>Ingen ordrer funnet.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order, idx) => (
            <li key={idx} className="order-item">
              <button
                className="order-dropdown-btn"
                onClick={() => toggleDropdown(idx)}
              >
                Ordre Referanse: {order.orderReference || "Ukjent"}{" "}
                <span style={{ float: "right" }}>
                  {openIndex === idx ? "▲" : "▼"}
                </span>
              </button>
              {openIndex === idx && (
                <div className="order-details">
                  <div className="order-info">
                    <strong>Navn:</strong> {order.buyerName || "Ukjent"}
                  </div>
                  <div className="order-info">
                    <strong>Telefonnummer:</strong> {order.phoneNumber || "Ukjent"}
                  </div>
                  <div className="order-info">
                    <strong>Kjøpsdato:</strong>{" "}
                    {order.datePurchased
                      ? (() => {
                          const d = new Date(order.datePurchased);
                          const day = String(d.getDate()).padStart(2, "0");
                          const month = String(d.getMonth() + 1).padStart(2, "0");
                          const year = String(d.getFullYear()).slice(-2);
                          const hour = String(d.getHours()).padStart(2, "0");
                          const min = String(d.getMinutes()).padStart(2, "0");
                          return `${day}.${month}.${year} kl.${hour}:${min}`;
                        })()
                      : "Ukjent"}
                  </div>
                  <div className="order-info">
                    <strong>Totalt:</strong> {order.totalPrice} kr
                  </div>
                  <ul className="order-products-list">
                    {order.items?.map((item, i) => (
                      <li key={i}>
                        {item.quantity}x {item.name} = {item.price * item.quantity} kr
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}