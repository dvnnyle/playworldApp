import React, { useEffect, useState } from "react";

export default function OrderStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data.reverse()); // Show newest first
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Laster ordre...</div>;
  if (!orders.length) return <div>Ingen ordre funnet.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Alle ordre</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Referanse</th>
            <th>Navn</th>
            <th>E-post</th>
            <th>Telefon</th>
            <th>Beløp</th>
            <th>Status</th>
            <th>Opprettet</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.reference}>
              <td>{order.reference}</td>
              <td>{order.buyerName}</td>
              <td>{order.email}</td>
              <td>{order.phoneNumber}</td>
              <td>{order.amountValue ? (order.amountValue / 100) + " kr" : ""}</td>
              <td>{order.status}</td>
              <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}