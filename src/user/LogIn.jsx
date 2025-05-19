import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./LogIn.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/profile");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile");
    } catch (error) {
      let message = "";
      switch (error.code) {
        case "auth/invalid-email":
          message = "Invalid email address.";
          break;
        case "auth/user-disabled":
          message = "User account is disabled.";
          break;
        case "auth/user-not-found":
          message = "No user found with this email.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password.";
          break;
        default:
          message = error.message;
      }
      setErrorMsg(message);
    }

    setLoading(false);
  }

  return (
    <>

    
      <div className="global-rectangle">
        <h1 className="global-title">BRUKER</h1>
      </div>


      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Logg inn"}
        </button>
        {errorMsg && <p className="error-message">{errorMsg}</p>}

        <div className="create-account-container">
          <p className="create-account-text">
            Ingen bruker?{" "}
            <button
              type="button"
              className="create-account-button"
              onClick={() => navigate("/CreateUser")}
            >
              Opprett bruker her
            </button>
          </p>
        </div>
      </form>
    </>
  );
}
