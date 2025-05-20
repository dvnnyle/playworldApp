import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import "./Settings.css";

export default function Settings() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // For password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  // Fetch user data on mount
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setDob(data.dob || "");
      }
      setLoading(false);
    });
  }, []);

  // Handle save/update for profile
  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Update Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        email,
        phone,
        dob,
      });

      // Update Auth profile (displayName and email)
      await updateProfile(user, { displayName: `${firstName} ${lastName}` });
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      setMsg("Endringer lagret!");
    } catch (err) {
      setMsg("Feil: " + err.message);
    }
  };

  // Handle password change with re-authentication
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Re-authenticate user with old password
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      setPasswordMsg("Passord oppdatert!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordMsg("Feil: " + err.message);
    }
  };

  if (loading) return <div className="settings-container">Laster...</div>;

  return (
    <>
          <div className="global-rectangle">
        <h1 className="global-title">INNSTILLINGER</h1>
      </div>
      <div className="settings-container">
        <h2 className="title-form">Endre profil</h2>
        <form onSubmit={handleSave} className="settings-form">
          <label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Fornavn"
            />
          </label>
          <label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Etternavn"
            />
          </label>
          <label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Din e-post"
            />
          </label>
          <label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ditt telefonnummer"
            />
          </label>
          <label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
            />
          </label>
          <button type="submit" className="settings-save-btn">
            Lagre endringer
          </button>
          {msg && <p style={{ color: "green", marginTop: 10 }}>{msg}</p>}
        </form>
      </div>

      <div className="settings-container-pw">
        <h2 className="title-form">Endre Passord</h2>
        <form onSubmit={handlePasswordChange} className="settings-form">
          <label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Nåværende passord"
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nytt passord"
              autoComplete="new-password"
              required
            />
          </label>
          <button type="submit" className="settings-save-btn">
            Lagre passord
          </button>
          {passwordMsg && <p style={{ color: "green", marginTop: 10 }}>{passwordMsg}</p>}
        </form>
      </div>
    </>
  );
}