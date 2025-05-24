import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./CustomerOrderList.css";

const BACKEND_URL = "http://localhost:4000"; // Change to your backend URL

export default function CustomerOrderList() {
  const { userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [refundedItems, setRefundedItems] = useState({});
  const [refundedOrders, setRefundedOrders] = useState({});

  useEffect(() => {
    async function fetchOrders() {
      try {
        const ordersColRef = collection(db, "users", userId, "newOrders");
        const ordersSnapshot = await getDocs(ordersColRef);
        setOrders(
          ordersSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((order) => !!order.orderReference)
        );
      } catch (err) {
        setError("Kunne ikke hente ordre: " + err.message);
      }
      setLoading(false);
    }
    fetchOrders();
  }, [userId]);

  useEffect(() => {
    // Load refunded state from localStorage on mount
    const refundedItemsLS = JSON.parse(localStorage.getItem("refundedItems") || "{}");
    const refundedOrdersLS = JSON.parse(localStorage.getItem("refundedOrders") || "{}");
    setRefundedItems(refundedItemsLS);
    setRefundedOrders(refundedOrdersLS);
  }, []);

  const toggleDropdown = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  async function handleRefund(orderReference, item, refundQty, pricePerUnit) {
    try {
      const refundReason = item
        ? `Refund item: ${item.name} x${refundQty}`
        : "Full order refund";

      const amountInMinorUnits = Math.round(pricePerUnit * refundQty * 100);

      const response = await fetch(`${BACKEND_URL}/refund-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: orderReference,
          amountValue: amountInMinorUnits,
          refundReason: refundReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Refund failed: ${error.error || JSON.stringify(error)}`);
        return;
      }

      alert("Refund successful");

      if (item) {
        const key = `${orderReference}_${item.name}`;
        const prevQty = refundedItems[key] || 0;
        const newRefundedItems = {
          ...refundedItems,
          [key]: prevQty + refundQty,
        };
        setRefundedItems(newRefundedItems);
        localStorage.setItem("refundedItems", JSON.stringify(newRefundedItems));
      } else {
        const newRefundedOrders = {
          ...refundedOrders,
          [orderReference]: true,
        };
        setRefundedOrders(newRefundedOrders);
        localStorage.setItem("refundedOrders", JSON.stringify(newRefundedOrders));
      }
    } catch (error) {
      alert("Refund error: " + error.message);
    }
  }

  if (loading) return <p>Laster ordre...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="customer-orders-container">
      <h1 className="customer-orders-title">Ordre for bruker</h1>
      <Link to="/admin" className="customer-orders-backlink">
        ← Tilbake til admin
      </Link>
      {orders.length === 0 ? (
        <p style={{ marginTop: 24 }}>Ingen ordre funnet for denne brukeren.</p>
      ) : (
        <ul className="customer-orders-list">
          {orders.map((order, idx) => (
            <li key={order.id || idx} className="customer-orders-listitem">
              <button
                className="customer-orders-togglebtn"
                onClick={() => toggleDropdown(idx)}
              >
                Ordre Referanse: {order.orderReference || order.id || "Ukjent"}{" "}
                <span style={{ float: "right" }}>
                  {openIndex === idx ? "▲" : "▼"}
                </span>
              </button>
              {openIndex === idx && (
                <div className="customer-orders-ordercontent">
                  <div>
                    <strong>Navn:</strong> {order.buyerName || "Ukjent"}
                  </div>
                  <div>
                    <strong>Telefonnummer:</strong> {order.phoneNumber || "Ukjent"}
                  </div>
                  <div>
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
                  <div>
                    <strong>Totalt:</strong>{" "}
                    {order.totalPrice ? `${order.totalPrice} kr` : "Ukjent"}
                  </div>
                  <ul className="customer-orders-products">
                    {(order.items || order.products || []).map((item, i) => {
                      const totalItemPrice =
                        item.price && item.quantity
                          ? item.price * item.quantity
                          : item.price || 0;
                      const key = `${order.orderReference}_${item.name}`;
                      const refundedQty = refundedItems[key] || 0;
                      const remainingQty = (item.quantity || 1) - refundedQty;
                      const currentRefundQty = 1;

                      return (
                        <li key={i} className={remainingQty === 0 ? "refunded-item" : ""}>
                          {item.quantity}x {item.name} = {totalItemPrice} kr{" "}
                          {remainingQty === 0 ? (
                            <span className="refunded-label">All refunded</span>
                          ) : (
                            <>
                              <button
                                className="refund-btn"
                                style={{ marginLeft: 8 }}
                                onClick={() =>
                                  handleRefund(order.orderReference, item, currentRefundQty, item.price)
                                }
                                disabled={remainingQty === 0}
                              >
                                Refund 1x
                              </button>
                              {refundedQty > 0 && (
                                <span className="refunded-label" style={{ marginLeft: 8 }}>
                                  Refunded: {refundedQty}x
                                </span>
                              )}
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    style={{ marginTop: 12, padding: "6px 12px" }}
                    className={
                      refundedOrders[order.orderReference]
                        ? "refunded-order"
                        : "refund-btn"
                    }
                    onClick={() =>
                      handleRefund(order.orderReference, null, order.totalPrice, 1)
                    }
                    disabled={refundedOrders[order.orderReference]}
                  >
                    {refundedOrders[order.orderReference]
                      ? "Full amount refunded"
                      : "Refund Full Order"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
