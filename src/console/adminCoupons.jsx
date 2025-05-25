import React, { useState, useEffect } from "react";
import "./adminCoupons.css";
import { collection, setDoc, getDocs, deleteDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaGift } from "react-icons/fa";
import AdminNavBar from "../console/navBar/AdminNavBar";
import { useNavigate } from "react-router-dom";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    expiration: "",
    unlimited: false,
  });
  const [modalCoupon, setModalCoupon] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [couponsUsedMap, setCouponsUsedMap] = useState({});
  const [allTimeCouponsUsed, setAllTimeCouponsUsed] = useState(0);
  const navigate = useNavigate();

  // Protect route: Only allow access if logged in as admin
  useEffect(() => {
    if (localStorage.getItem("isAdminLoggedIn") !== "true") {
      navigate("/adminlogin");
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchCoupons() {
      const couponsRef = collection(db, "myCouponsFb");
      const snapshot = await getDocs(couponsRef);
      const couponsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCoupons(couponsList);
    }
    fetchCoupons();
  }, []);

  useEffect(() => {
    async function fetchCouponsUsed() {
      const couponsRef = collection(db, "myCouponsFb");
      const couponsSnap = await getDocs(couponsRef);
      const couponsUsedMap = {};

      // For each coupon, count the docs in its couponsUsed subcollection
      for (const couponDoc of couponsSnap.docs) {
        const couponId = couponDoc.id;
        const usedSnap = await getDocs(collection(db, "myCouponsFb", couponId, "couponsUsed"));
        couponsUsedMap[couponId] = usedSnap.size;
      }
      setCouponsUsedMap(couponsUsedMap);
    }
    fetchCouponsUsed();
  }, []);

  // Fetch all-time total coupons used from TotalCouponsUsed/used/field: total
  useEffect(() => {
    async function fetchAllTimeCouponsUsed() {
      try {
        const docRef = doc(db, "TotalCouponsUsed", "used");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAllTimeCouponsUsed(docSnap.data().total || 0);
        }
      } catch (err) {
        setAllTimeCouponsUsed(0);
      }
    }
    fetchAllTimeCouponsUsed();
  }, []);

  useEffect(() => {
    if (timerActive) {
      if (timeLeft <= 0) {
        closeModal();
        setTimerActive(false);
        setTimeLeft(300);
        return;
      }
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerActive, timeLeft]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "unlimited") {
      setForm({
        ...form,
        unlimited: checked,
        expiration: checked ? "" : form.expiration,
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || (!form.expiration && !form.unlimited)) return;

    const newCoupon = {
      ...form,
      category: "coupons",
      createdAt: serverTimestamp(),
      expiration: form.unlimited ? null : form.expiration,
    };

    // Use the title as the document ID (replace spaces with underscores for safety)
    const couponId = form.title.replace(/\s+/g, "_");

    await setDoc(doc(db, "myCouponsFb", couponId), newCoupon);

    setCoupons([
      ...coupons,
      { ...newCoupon, id: couponId, dateMade: new Date().toISOString() },
    ]);
    setForm({ title: "", description: "", expiration: "", unlimited: false });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Ingen utløpsdato";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };

  const closeModal = () => setModalCoupon(null);

  function formatTimer(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <>
      <AdminNavBar />
      <div className="admin-top-card">
        <h1 className="admin-top-card-title">Adminpanel</h1>
      </div>
      <div className="admin-coupons-container">
        <form onSubmit={handleSubmit} className="admin-coupons-form">
          <h2 className="admin-coupons-title">Opprett en kupong</h2>
          <input
            name="title"
            placeholder="Kupongtittel"
            value={form.title}
            onChange={handleChange}
            className="admin-coupons-input"
          />
          <input
            name="description"
            placeholder="Beskrivelse"
            value={form.description}
            onChange={handleChange}
            className="admin-coupons-input"
          />
          <input
            name="expiration"
            type="date"
            placeholder="Utløpsdato"
            value={form.expiration}
            onChange={handleChange}
            className="admin-coupons-input"
            disabled={form.unlimited}
          />
          <label style={{ marginTop: 10 }}>
            <input
              type="checkbox"
              name="unlimited"
              checked={form.unlimited}
              onChange={handleChange}
              style={{ marginRight: 8 }}
            />
            Ubegrenset bruk (ingen utløpsdato)
          </label>
          <button type="submit" className="admin-coupons-button">
            Legg til kupong
          </button>
        </form>

        <div className="coupon-counter-card">
          <div className="coupon-counter-title">Kupongstatistikk</div>
          <div className="coupon-counter-alltime">
            Totalt brukte: {allTimeCouponsUsed}
          </div>
          <div style={{ marginTop: 10 }}>
            {coupons.map((coupon) => (
              <div key={coupon.id} style={{ color: "#b89c2c", fontWeight: 600, fontSize: "1rem" }}>
                {coupon.title}: {couponsUsedMap[coupon.id] || 0} personer
              </div>
            ))}
          </div>
        </div>
        <hr style={{ width: "50%", marginTop: "30px"}} />
        <h3 className="admin-coupons-list-title">Kuponger</h3>
        <div className="admin-coupons-list">
          {coupons.map((coupon, idx) => (
            <div
              className="admin-coupon-card"
              key={idx}
              style={{ position: "relative", cursor: "pointer" }}
              onClick={() => setModalCoupon(coupon)}
            >
              <button
                className="admin-coupon-delete"
                onClick={async (e) => {
                  e.stopPropagation();
                  const couponId = coupon.id;

                  await deleteDoc(doc(db, "myCouponsFb", couponId));

                  setCoupons(coupons.filter((c) => c.id !== couponId));
                  // Do NOT update couponsUsedMap or the statistics display here
                }}
                aria-label="Slett kupong"
              >
                ✕
              </button>
              <div className="admin-coupon-emoji">🎫</div>
                <div className="admin-coupon-separator"></div> {/* <-- Add this */}

              <div className="admin-coupon-text">
                <div className="admin-coupon-label">
                  <FaGift style={{ marginRight: 4 }} /> KUPONG
                </div>
                <div className="admin-coupon-title">{coupon.title}</div>
                <div className="admin-coupon-description">
                  {coupon.description}
                </div>
                <span className="admin-coupon-expiration">
                  {coupon.unlimited || coupon.expiration === null
                    ? "Ingen utløpsdato"
                    : coupon.expiration && coupon.expiration.trim() !== ""
                    ? `Utløper: ${formatDate(coupon.expiration)}`
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Simple Modal */}
        {modalCoupon && (
          <div className="coupon-modal-overlay" onClick={closeModal}>
            <div className="coupon-modal" onClick={e => e.stopPropagation()}>
              <div className="coupon-modal-header">
                <span className="admin-coupon-label">
                  <FaGift style={{ marginRight: 4 }} /> KUPONG
                </span>
                <button className="coupon-modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="coupon-modal-title">{modalCoupon.title}</div>
              <div className="coupon-modal-description">{modalCoupon.description}</div>
              <div className="coupon-modal-expiration">
                {modalCoupon.unlimited || modalCoupon.expiration === null
                  ? "Ingen utløpsdato"
                  : modalCoupon.expiration && modalCoupon.expiration.trim() !== ""
                  ? `Utløper: ${formatDate(modalCoupon.expiration)}`
                  : ""}
              </div>
              {timerActive && (
                <div style={{ color: "#b89c2c", fontWeight: 600, marginBottom: 10 }}>
                  Tid igjen: {formatTimer(timeLeft)}
                </div>
              )}
              <button
                className="coupon-modal-use"
                onClick={() => {
                  setTimerActive(true);
                }}
                disabled={timerActive}
              >
                {timerActive ? "Aktivert" : "Bruk kupong"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminCoupons;