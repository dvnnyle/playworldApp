import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentReturn.css";
import { db, auth } from "../firebase";
import { doc, collection, addDoc, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

async function captureVippsPayment(reference, amountValue) {
  try {
    const response = await fetch("/capture-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, amountValue }),
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (err) {
    console.error("Manual Vipps capture failed:", err);
    return null;
  }
}

export default function PaymentReturn() {
  const [orderReference, setOrderReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [products] = useState([]);
  const [pspReference, setPspReference] = useState("");
  const [vippsAggregate, setVippsAggregate] = useState(null);
  const [orderStatus, setOrderStatus] = useState("payment_in_progress");
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Load order info from localStorage on mount
  useEffect(() => {
    const storedReference = localStorage.getItem("orderReference");
    const storedPhone = localStorage.getItem("phoneNumber");
    const storedName = localStorage.getItem("buyerName");
    const storedEmail = localStorage.getItem("email");
    const storedCart = localStorage.getItem("cartItems");
    const storedAggregate = localStorage.getItem("vippsAggregate");

    if (storedReference) setOrderReference(storedReference);
    if (storedPhone) setPhoneNumber(storedPhone);
    if (storedName) setBuyerName(storedName);
    if (storedEmail) setEmail(storedEmail);

    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      setCartItems(parsedCart);

      const now = new Date().toISOString();

      // Update cart items with orderReference and datePurchased
      const updatedCart = parsedCart.map(item =>
        item.category === "lek" && item.type === "ticket"
          ? { ...item, orderReference: storedReference, datePurchased: now }
          : item
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));

      // Store order in localStorage orders array (for offline use)
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

    // Load aggregate and set order status
    if (storedAggregate) {
      const agg = JSON.parse(storedAggregate);
      setVippsAggregate(agg);
      if (agg.capturedAmount?.value > 0) {
        setOrderStatus("captured");
      } else if (agg.authorizedAmount?.value > 0) {
        setOrderStatus("reserved");
      } else {
        setOrderStatus("payment_in_progress");
      }
    }
  }, []);

  // Save order to Firestore after pspReference is set
  useEffect(() => {
    if (!pspReference) return;

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
      const storedPspReference = pspReference; // Use state, not localStorage

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
          pspReference: storedPspReference || "",
          vippsAggregate: vippsAggregate || null,
        };

        try {
          const userDocRef = doc(db, "users", user.email.toLowerCase());
          const ordersColRef = collection(userDocRef, "newOrders");

          const querySnapshot = await getDocs(ordersColRef);
          const alreadyExists = querySnapshot.docs.some(
            (doc) => doc.data().orderReference === newOrder.orderReference
          );

          if (!alreadyExists) {
            await addDoc(ordersColRef, newOrder);
            console.log("Order added to newOrders subcollection!");
          } else {
            console.log("Order with this reference already exists, not adding duplicate.");
          }
        } catch (err) {
          console.error("Failed to add order to newOrders subcollection:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [pspReference, vippsAggregate]);

  useEffect(() => {
    // Only try manual capture if payment is reserved and not captured
    if (
      vippsAggregate &&
      vippsAggregate.capturedAmount.value === 0 &&
      vippsAggregate.authorizedAmount.value > 0 &&
      orderReference &&
      totalPrice > 0
    ) {
      const timer = setTimeout(async () => {
        const captureRes = await captureVippsPayment(orderReference, totalPrice * 100);
        if (captureRes && captureRes.aggregate) {
          setVippsAggregate(captureRes.aggregate);
          if (captureRes.aggregate.capturedAmount.value > 0) {
            setOrderStatus("captured");
            localStorage.setItem("vippsAggregate", JSON.stringify(captureRes.aggregate));
          }
        }
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer);
    }
  }, [vippsAggregate, orderReference, totalPrice]);

  function formatDurationFromMinutes(minutes) {
    if (!minutes || minutes <= 0) return "Ukjent varighet";
    if (minutes < 60) return `${minutes} minutter`;
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours} timer` : `${hours.toFixed(1)} timer`;
  }

  const tickets = cartItems
    .filter((item) => item.category === "lek" && item.type === "ticket")
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        ...item,
        duration: product?.duration ?? item.duration,
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

          {/* Show Vipps aggregate capture info if available */}
          {vippsAggregate ? (
            <div className="vipps-aggregate-box" style={{ marginTop: 24 }}>
              <h3>Vipps Betalingsstatus:</h3>
              <ul>
                <li>
                  <strong>Autorisert beløp:</strong>{" "}
                  {vippsAggregate.authorizedAmount.value / 100}{" "}
                  {vippsAggregate.authorizedAmount.currency}
                </li>
                <li>
                  <strong>Kansellert beløp:</strong>{" "}
                  {vippsAggregate.cancelledAmount.value / 100}{" "}
                  {vippsAggregate.cancelledAmount.currency}
                </li>
                <li>
                  <strong>Fanget beløp:</strong>{" "}
                  {vippsAggregate.capturedAmount.value / 100}{" "}
                  {vippsAggregate.capturedAmount.currency}
                  <h3>
                    {vippsAggregate.capturedAmount.value > 0
                      ? "Fanget: Godkjent"
                      : vippsAggregate.authorizedAmount.value > 0
                      ? "Reservert: Ikke fanget enda"
                      : "Ikke godkjent"}
                  </h3>
                </li>
                <li>
                  <strong>Refundert beløp:</strong>{" "}
                  {vippsAggregate.refundedAmount.value / 100}{" "}
                  {vippsAggregate.refundedAmount.currency}
                </li>
              </ul>
            </div>
          ) : (
            <div className="vipps-aggregate-box" style={{ marginTop: 24 }}>
              <h3>Betaling pågår...</h3>
              <p>
                Vennligst vent, betalingen behandles. Du kan lukke denne siden og komme tilbake senere for å se status.
              </p>
            </div>
          )}

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
