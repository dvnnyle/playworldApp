import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  addDoc,
} from "firebase/firestore";
import { FaGift } from "react-icons/fa";

export default function Koupons() {
  const navigate = useNavigate();

  const [userCoupons, setUserCoupons] = useState([]);
  const [modalCoupon, setModalCoupon] = useState(null);
  const [activeCouponId, setActiveCouponId] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [usedCoupons, setUsedCoupons] = useState({});
  const [loading, setLoading] = useState(true);

  // Load coupons and used 
  useEffect(() => {
    let unsub;
    (async () => {
      unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setLoading(false);
          return;
        }
        const userEmail = user.email.toLowerCase();

        // Fetch global and user coupons in parallel
        const [globalSnap, userSnap] = await Promise.all([
          getDocs(collection(db, "myCouponsFb")),
          getDocs(collection(db, "users", userEmail, "coupons")),
        ]);
        const globalCoupons = globalSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Build a map for quick lookup
        const userCouponMap = {};
        userSnap.docs.forEach(doc => {
          userCouponMap[doc.id] = doc.data();
        });

        // Find missing coupons (only add what's missing)
        const missing = globalCoupons.filter(gc => !userCouponMap[gc.id]);
        if (missing.length > 0) {
          await Promise.all(
            missing.map(coupon =>
              setDoc(doc(db, "users", userEmail, "coupons", coupon.id), {
                ...coupon,
                used: false,
                category: "coupons",
              })
            )
          );
        }

        // Find removed coupons (only mark as deleted if needed)
        const removed = userSnap.docs.filter(
          uc => !globalCoupons.find(gc => gc.id === uc.id) && !uc.data().deleted
        );
        if (removed.length > 0) {
          await Promise.all(
            removed.map(uc =>
              updateDoc(doc(db, "users", userEmail, "coupons", uc.id), {
                deleted: true,
              })
            )
          );
        }

        // Use the already-fetched userSnap if no changes, else refetch
        let couponsDocs = userSnap.docs;
        if (missing.length > 0 || removed.length > 0) {
          const updatedSnap = await getDocs(collection(db, "users", userEmail, "coupons"));
          couponsDocs = updatedSnap.docs;
        }

        const coupons = couponsDocs
          .filter(doc => !doc.data().deleted)
          .map(doc => ({ id: doc.id, ...doc.data() }));

        const usedMap = {};
        coupons.forEach(c => {
          if (c.used) usedMap[c.id] = true;
        });

        setUserCoupons(coupons);
        setUsedCoupons(usedMap);
        setLoading(false);
      });
    })();
    return () => unsub && unsub();
  }, []);

  const markCouponAsUsed = useCallback(async (couponId) => {
    const coupon = userCoupons.find(c => c.id === couponId);
    const isUnlimited = coupon && (coupon.unlimited || coupon.expiration === null);

    // Only mark as used for limited coupons
    if (!isUnlimited) {
      setUsedCoupons(prev => ({ ...prev, [couponId]: true }));
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.email.toLowerCase(), "coupons", couponId);
        await updateDoc(userRef, { used: true });
      }
    }

    setTimerActive(false);
    setActiveCouponId(null);
    setModalCoupon(null);
    setTimeLeft(60);
    localStorage.removeItem("activeCouponTimer");
  }, [userCoupons]);

  useEffect(() => {
    const timerData = localStorage.getItem("activeCouponTimer");
    if (timerData) {
      const { id, endTime } = JSON.parse(timerData);
      const diff = Math.floor((endTime - Date.now()) / 1000);
      if (diff > 0) {
        setActiveCouponId(id);
        setTimerActive(true);
        setTimeLeft(diff);
      } else {
        markCouponAsUsed(id);
      }
    }
  }, [markCouponAsUsed]);

  // Timer effect
  useEffect(() => {
    if (timerActive && activeCouponId) {
      if (timeLeft <= 0) {
        markCouponAsUsed(activeCouponId);
        return;
      }
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerActive, timeLeft, activeCouponId, markCouponAsUsed]);

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  }

  function formatTimer(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  async function handleUse() {
    if (!timerActive && modalCoupon) {
      // Track usage for statistics immediately on click
      const user = auth.currentUser;
      if (user) {
        await addDoc(
          collection(db, "myCouponsFb", modalCoupon.id, "couponsUsed"),
          {
            user: user.email.toLowerCase(),
            usedAt: new Date().toISOString(),
          }
        );
        const totalRef = doc(db, "TotalCouponsUsed", "used");
        await updateDoc(totalRef, { total: increment(1) });
      }

      // Start timer as before
      const endTime = Date.now() + 15 * 1000;
      setActiveCouponId(modalCoupon.id);
      setTimerActive(true);
      setTimeLeft(15);
      localStorage.setItem(
        "activeCouponTimer",
        JSON.stringify({ id: modalCoupon.id, endTime })
      );
    }
  }

  function handleCardClick(coupon, idx) {
    if (navigator.vibrate) navigator.vibrate(30); // Vibrate on every click (if supported)
    const isUnlimited = coupon.unlimited || coupon.expiration === null;
    if (
      (isUnlimited || !usedCoupons[coupon.id]) &&
      (!timerActive || activeCouponId === coupon.id)
    ) {
      setModalCoupon({ ...coupon, idx });
    }
  }

  return (
    <>
      <div className="global-rectangle">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="global-title">KUPONGER</h1>
      </div>
      <div className="admin-coupons-container">
        <h2 className="admin-coupons-title">Mine kuponger</h2>

        {loading ? (
          <div style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
            Laster kuponger...
          </div>
        ) : (
          <div className="admin-coupons-list">
            {userCoupons.length === 0 && (
              <div style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
                Ingen kuponger tilgjengelig.
              </div>
            )}
            {userCoupons.map((coupon, idx) => {
              const isUnlimited = coupon.unlimited || coupon.expiration === null;
              const isUsed = usedCoupons[coupon.id];
              const isOtherTimerActive = timerActive && activeCouponId !== coupon.id;

              return (
                <div
                  className="admin-coupon-card"
                  key={coupon.id}
                  onClick={() => handleCardClick(coupon, idx)}
                  draggable={false}
                  onDragStart={e => e.preventDefault()}
                  style={{
                    position: "relative",
                    opacity: !isUnlimited && isUsed ? 0.5 : 1,
                    pointerEvents:
                      (!isUnlimited && isUsed) || (isOtherTimerActive && !isUnlimited)
                        ? "none"
                        : "auto",
                    cursor:
                      (!isUnlimited && isUsed) || (isOtherTimerActive && !isUnlimited)
                        ? "default"
                        : "pointer",
                  }}
                >
                  <div className="admin-coupon-emoji">🎫</div>
                                  <div className="admin-coupon-separator"></div> {/* <-- Add this */}

                  <div className="admin-coupon-text">
                    <div className="admin-coupon-label">
                      <FaGift style={{ marginRight: 4 }} /> Kupong
                    </div>
                    <div className="admin-coupon-title">{coupon.title}</div>
                    <div className="admin-coupon-description">
                      {coupon.description}
                    </div>
                    {coupon.expiration && (
                      <span className="admin-coupon-expiration">
                        Utløper: {formatDate(coupon.expiration)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modalCoupon && (
          <div className="coupon-modal-overlay" onClick={() => setModalCoupon(null)}>
            <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
              <div className="coupon-modal-header">
                <span className="admin-coupon-label">
                  <FaGift style={{ marginRight: 4 }} /> KUPONG
                </span>
                <button
                  className="coupon-modal-close"
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(30);
                    setModalCoupon(null);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="coupon-modal-title">{modalCoupon.title}</div>
              <div className="coupon-modal-description">
                {modalCoupon.description}
              </div>
              {modalCoupon.expiration && (
                <div className="coupon-modal-expiration">
                  Utløper: {formatDate(modalCoupon.expiration)}
                </div>
              )}
              {timerActive && activeCouponId === modalCoupon.id ? (
                <div style={{ color: "#b89c2c", fontWeight: 600, marginBottom: 10 }}>
                  Utløper om: {formatTimer(timeLeft)}
                </div>
              ) : (
                (!usedCoupons[modalCoupon.id] || modalCoupon.unlimited || modalCoupon.expiration === null) && (
                  <button
                    className="coupon-modal-use"
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(30);
                      handleUse();
                    }}
                  >
                    Bruk kupong
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
