import React, { useState } from "react";
import './CreateUser.css';

import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import pwsLogo from "../assets/logo.png"; // Make sure the path is correct

export default function CreateUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update displayName in Auth profile
      await updateProfile(user, { displayName: name });

      // Store additional user info in Firestore under email as document ID
      await setDoc(doc(db, "users", email.toLowerCase()), {
        name,
        email: email.toLowerCase(),
        phone,
        createdAt: serverTimestamp(),
      });

      setMsg("User created successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");

      // Redirect to login page after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMsg("Error: " + error.message);
    }

    setLoading(false);
  }

  return (
    <div>
      <div className="global-rectangle">
        <h1 className="global-title">NY BRUKER</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <img
          src={pwsLogo}
          alt="PWS logo"
          style={{ width: "80px", display: "block", margin: "0 auto 16px auto" }}
        />
        <h2 style={{ textAlign: "center" }}>Opprett ny bruker</h2>
        
        <input
          placeholder="Navn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
<button
  type="submit"
  className="create-user-btn"
  disabled={loading}
>
  {loading ? "Lagrer..." : "Opprett bruker"}
</button>
        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}