import React, { useEffect, useState, useRef } from "react";
import "./Tickete.css";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const intervalsRef = useRef({});

  // Load tickets from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      const parsed = JSON.parse(storedCart)
        .filter(item => item.category === "lek" && item.type === "ticket")
        .map(item => ({
          ...item,
          id: item.productId || item.orderReference || Math.random().toString(36).slice(2),
        }));
      setTickets(parsed);
    }
  }, []);

  // Start countdown for a ticket
  const startCountdown = (ticket) => {
    if (intervalsRef.current[ticket.id] || countdowns[ticket.id]) return;
    setCountdowns(prev => ({
      ...prev,
      [ticket.id]: ticket.duration * 60,
    }));
    intervalsRef.current[ticket.id] = setInterval(() => {
      setCountdowns(prev => {
        const newVal = (prev[ticket.id] || 0) - 1;
        if (newVal <= 0) {
          clearInterval(intervalsRef.current[ticket.id]);
          delete intervalsRef.current[ticket.id];
          return { ...prev, [ticket.id]: 0 };
        }
        return { ...prev, [ticket.id]: newVal };
      });
    }, 1000);
  };

  // Clean up intervals on unmount
  useEffect(() => {
    const intervals = intervalsRef.current; // capture ref value
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, []);

  function formatTime(secs) {
    if (secs <= 0) return "00:00:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map(x => String(x).padStart(2, "0")).join(":");
  }

  function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h} ${h === 1 ? "time" : "timer"} og ${m} minutter`;
    if (h > 0) return `${h} ${h === 1 ? "time" : "timer"}`;
    return `${m} minutter`;
  }

  return (
    <div className="tickets-page">
      <h1>Dine Billetter</h1>
      <ul className="ticket-list">
        {tickets.map(ticket => (
          <li key={ticket.id} className="ticket-item">
            <div>
              <strong>{ticket.name}</strong>
              <div>
                Ordre-ID: <span>{ticket.orderReference || "Ukjent"}</span>
              </div>
              <div>
                Kjøpt:{" "}
                <span>
                  {ticket.datePurchased
                    ? (() => {
                        const d = new Date(ticket.datePurchased);
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

              <div className="ticket-duration">
                Varighet: {ticket.duration ? formatDuration(ticket.duration) : "Ukjent"}
              </div>

              {/* Only show countdown when started */}
              {countdowns[ticket.id] !== undefined ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  <span style={{ fontWeight: 600 }}>Tid igjen:</span>
                  <h3 className="ticket-timer" style={{ margin: 0 }}>
                    {formatTime(countdowns[ticket.id])}
                  </h3>
                </div>
              ) : (
                <button
                  className="start-ticket-btn"
                  onClick={() => startCountdown(ticket)}
                  style={{ marginTop: 10 }}
                >
                  Start nedtelling
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
