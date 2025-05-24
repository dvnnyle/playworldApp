import React, { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const q = query(
        collection(db, "adminUsers"),
        where("username", "==", username.trim())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("");
        localStorage.setItem("isAdminLoggedIn", "true");
        navigate("/admin");
      } else {
        setError("Invalid username");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="admin-input"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <style>{`
        .admin-login-container {
          max-width: 320px;
          margin: 100px auto;
          padding: 32px 24px 24px 24px;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background: #fafbfc;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .admin-login-container h2 {
          text-align: center;
          margin-bottom: 24px;
          color: #222;
        }
        .input-group {
          margin-bottom: 16px;
        }
        .admin-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #bdbdbd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border 0.2s;
        }
        .admin-input:focus {
          border: 1.5px solid #1976d2;
          outline: none;
        }
        .error-message {
          color: #d32f2f;
          margin-bottom: 14px;
          text-align: center;
        }
        .login-btn {
          width: 100%;
          padding: 10px 0;
          background: #1976d2;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .login-btn:hover {
          background: #1565c0;
        }
      `}</style>
    </div>
  );
}

export default AdminLogin;