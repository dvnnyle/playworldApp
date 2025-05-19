import { useState, useEffect } from "react";
import "./NewsForm.css";
import { db } from "../../firebase";
import { doc, setDoc, deleteDoc, getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { FaNewspaper } from "react-icons/fa";
import newsImg from "../../assets/newsimg.png";
import newsImg2 from "../../assets/newsimg2.png";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(",", " kl.");
}

export default function NewsForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("Kristiansand");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");
  const [loggedInUsername, setLoggedInUsername] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const newsRef = collection(db, "news");
        const q = query(newsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const newsList = snapshot.docs.map(doc => doc.data());
        setPosts(newsList);
        localStorage.setItem("newsPosts", JSON.stringify(newsList));
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    }
    fetchPosts();
  }, []);

  const sanitizeTitle = (str) =>
    str.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    const image = location === "Triaden" ? newsImg2 : newsImg;

    const newPost = {
      title,
      content,
      location,
      image,
      timestamp: new Date().toLocaleString(),
    };

    try {
      const docId = sanitizeTitle(title);
      await setDoc(doc(db, "news", docId), newPost);

      setPosts([newPost, ...posts]);

      setTitle("");
      setLocation("Kristiansand");
      setContent("");
    } catch (error) {
      console.error("Error adding post: ", error);
    }
  };

  const openModal = (post) => {
    setModalPost(post);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleDelete = async (post) => {
    try {
      const docId = sanitizeTitle(post.title);
      await deleteDoc(doc(db, "news", docId));
      setPosts(posts.filter((p) => p.title !== post.title));
    } catch (error) {
      console.error("Error deleting post: ", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const q = query(
        collection(db, "adminUsers"),
        where("username", "==", username.trim())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setLoggedInUsername(username.trim());
      } else {
        setLoginError("Ugyldig brukernavn");
      }
    } catch (error) {
      console.error("Error checking admin username:", error);
      setLoginError("Noe gikk galt, prøv igjen senere.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setLoggedInUsername(null);
    setUsername("");
    setLoginError("");
  };

  if (!loggedInUsername) {
    return (
      <div className="login-container">
        <h2>Logg inn med brukernavn</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Brukernavn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logger inn..." : "Logg inn"}
          </button>
          {loginError && <p className="error">{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLogout} style={{ marginBottom: "1em" }}>
        Logg ut ({loggedInUsername})
      </button>

      <form onSubmit={handleSubmit} className="news-form">
        <h2>Publiser en nyhet</h2>

        <input
          type="text"
          placeholder="Tittel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="Kristiansand">Kristiansand</option>
          <option value="Triaden">Triaden</option>
        </select>

        <textarea
          placeholder="Innhold"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <button type="submit">Publiser</button>
      </form>

      <div className="posts-list">
        {posts.length === 0 && <p>Ingen nyheter publisert enda.</p>}

        {posts.map((post, index) => (
          <div
            key={index}
            className="preview-box"
            style={{ position: "relative" }}
          >
            <button
              className="delete-btn"
              onClick={() => handleDelete(post)}
              title="Slett nyhet"
            >
              &times;
            </button>

            <img
              src={post.image || newsImg}
              alt=""
              onClick={() => openModal(post)}
              style={{ cursor: "pointer" }}
            />

            <div
              className="preview-content"
              onClick={() => openModal(post)}
              style={{ cursor: "pointer" }}
            >
              <div className="news-label-container" aria-label="React Logo and News label">
                <FaNewspaper size={18} color="#20b14c" aria-label="React Logo" />
                <span className="news-label-text"></span>
              </div>

              <h3>{post.title || "(Ingen tittel)"}</h3>
              <p className="location">{post.location}</p>
              <small className="date">{formatDate(post.timestamp)}</small>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && modalPost && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={modalPost.image || newsImg}
              alt=""
              className="modal-image"
            />
            <h2>{modalPost.title}</h2>
            <p className="location"> {modalPost.location}</p>
            <small>{formatDate(modalPost.timestamp)}</small>
            <p className="modal-text">{modalPost.content}</p>
            <button onClick={closeModal} className="modal-close-btn">
              Lukk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}