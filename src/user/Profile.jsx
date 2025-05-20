import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaUserCircle } from "react-icons/fa";
import "./Profile.css";
import '../style/global.css';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
const userDocRef = doc(db, "users", user.email.toLowerCase());          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          setError("Error fetching user data: " + err.message);
        }
      } else {
        setError("No logged in user.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); 
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="global-rectangle">
        <h1 className="global-title">PROFIL</h1>
      </div>

      <div className="profile-container" style={{ textAlign: "center" }}>
        <FaUserCircle size={100} color="#555" style={{ marginBottom: 20 }} />
        <h2 className="nameTag" style={{ textTransform: "uppercase" }}>
          Hei, {userData.name}
        </h2>
        <p><strong>Email:</strong> {userData.email}</p>
        {userData.phone && <p><strong>Phone:</strong> {userData.phone}</p>}
        {userData.createdAt && (
          <p>
            <strong>Member since:</strong>{" "}
            {userData.createdAt.toDate
              ? userData.createdAt.toDate().toLocaleDateString()
              : userData.createdAt}
          </p>
        )}
      </div>

      <div className="profile-cards-wrapper">
        <div
          className="profile-card-button"
          onClick={() => {
            window.navigator.vibrate?.(10);
          }}
          tabIndex={0}
          role="button"
          onKeyPress={e => {
            if (e.key === "Enter" || e.key === " ") window.navigator.vibrate?.(10);
          }}
        >
          <div className="emoji-square">🎟️</div>
          <h3>KLIPPEKORT</h3>
        </div>
                <div
          className="profile-card-button"
          onClick={() => {
            window.navigator.vibrate?.(10);
            // Add your navigation or action here
          }}
          tabIndex={0}
          role="button"
          onKeyPress={e => {
            if (e.key === "Enter" || e.key === " ") {
              window.navigator.vibrate?.(10);
              // Add your navigation or action here
            }
          }}
        >
          <div className="emoji-square">🎫</div>
          <h3>BILETTER</h3>
        </div>
        <div
          className="profile-card-button"
          onClick={() => {
            window.navigator.vibrate?.(10);
          }}
          tabIndex={0}
          role="button"
          onKeyPress={e => {
            if (e.key === "Enter" || e.key === " ") window.navigator.vibrate?.(10);
          }}
        >
          <div className="emoji-square">🎉</div>
          <h3>KUPONGER</h3>
        </div>
        <div
          className="profile-card-button"
          onClick={() => {
            window.navigator.vibrate?.(10);
            navigate("/orders");
          }}
          tabIndex={0}
          role="button"
          onKeyPress={e => {
            if (e.key === "Enter" || e.key === " ") {
              window.navigator.vibrate?.(10);
              navigate("/orders");
            }
          }}
        >
          <div className="emoji-square">🏆</div>
          <h3>ORDRE</h3>
        </div>
        <div
          className="profile-card-button"
          style={{ cursor: "pointer" }}
          onClick={() => {
            window.navigator.vibrate?.(10);
            navigate("/Settings");
          }}
          tabIndex={0}
          role="button"
          onKeyPress={e => {
            if (e.key === "Enter" || e.key === " ") {
              window.navigator.vibrate?.(10);
              navigate("/Settings");
            }
          }}
        >
          <div className="emoji-square">⭐</div>
          <h3>INNSTILLINGER</h3>
        </div>
        {/* New card button below */}

        <hr style={{ width: "90%", margin: "20px auto" }} />

        <button
          className="logout-btn"
          onClick={() => {
            window.navigator.vibrate?.(10);
            handleLogout();
          }}
        >
          Logg ut
        </button>
      </div>
    </>
  );
}
