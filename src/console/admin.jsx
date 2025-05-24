import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import "../user/Profile.css";
import "../style/global.css";
import "../console/admin.css";
import AdminNavBar from "./navBar/AdminNavBar";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Protect route: Only allow access if logged in as admin
  useEffect(() => {
    if (localStorage.getItem("isAdminLoggedIn") !== "true") {
      navigate("/adminlogin");
    }
  }, [navigate]);

  // Fetch all users and their orders from Firestore
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch users
        const usersCol = collection(db, "users");
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);

        // Fetch newOrders subcollection for each user
        const ordersByUser = {};
        for (const user of userList) {
          const ordersColRef = collection(db, "users", user.id, "newOrders");
          const ordersSnapshot = await getDocs(ordersColRef);
          ordersByUser[user.id] = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        }
        setOrders(ordersByUser);
      } catch (err) {
        setError("Kunne ikke hente brukere eller ordre: " + err.message);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm("Er du sikker på at du vil slette denne brukeren?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert("Kunne ikke slette bruker: " + err.message);
    }
  };

  if (loading) return <p>Laster brukere...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <AdminNavBar />

      <div className="admin-top-card">
        <h1 className="admin-top-card-title">Adminpanel</h1>

      </div>

      <div className="profile-container">
        {/* Card above */}


        <h2>Brukere</h2>
        <table>
          <thead>
            <tr>
              <th>Navn</th>
              <th>E-post</th>
              <th>Telefon</th>
              <th>Handling</th>
              <th>Ordre</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name || "-"}</td>
                <td>{user.email || "-"}</td>
                <td>{user.phone || "-"}</td>
                <td>
                  <button
                    className="admin-delete-btn"
                    onClick={() => handleDelete(user.id)}
                  >
                    Slett
                  </button>
                </td>
                <td>
                  {orders[user.id] && orders[user.id].length > 0
                    ? (
                      <Link
                        to={`/customer-orders/${user.id}`}
                        className="admin-order-link"
                      >
                        {orders[user.id].filter(order => order && Object.keys(order).length > 1).length} ordre
                      </Link>
                    )
                    : <span className="admin-no-orders">Ingen ordre</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}