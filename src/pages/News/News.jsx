import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import NewsPostsList from "./NewsPostsList";
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

export default function News() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPost, setModalPost] = useState(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const newsRef = collection(db, "news");
        const q = query(newsRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const newsList = snapshot.docs.map(doc => doc.data());
        setPosts(newsList);
      } catch (error) {
        console.error("Error fetching news: ", error);
      }
      setLoading(false);
    }
    fetchNews();
  }, []);

  const openModal = (post) => {
    setModalPost(post);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  if (loading) return <p>Laster nyheter...</p>;

  return (
    <div>
      <div className="global-rectangle">
        <h1 className="global-title">NYHETER</h1>
      </div>
      <NewsPostsList posts={posts} onOpenModal={openModal} />
      {modalOpen && modalPost && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img
              src={
                modalPost.image ||
                (modalPost.location === "Triaden" ? newsImg2 : newsImg)
              }
              alt=""
              className="modal-image"
              draggable={false}
              tabIndex={-1}
              style={{ userSelect: "none", pointerEvents: "none" }}
              onContextMenu={e => e.preventDefault()}
            />
            <h2>{modalPost.title}</h2>
            <p className="location">{modalPost.location}</p>
            <small>{formatDate(modalPost.timestamp)}</small>
            <p className="modal-text">{modalPost.content}</p>
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(30);
                closeModal();
              }}
              className="modal-close-btn"
            >
              Lukk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
