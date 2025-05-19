// src/components/NewsPostsList.jsx
import { useState } from "react";
import newsImg from "../../assets/newsimg.png";
import newsImg2 from "../../assets/newsimg2.png";
import { FaNewspaper } from "react-icons/fa";

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

export default function NewsPostsList({ posts, onDelete, onOpenModal }) {
  const [showArchive, setShowArchive] = useState(false);

  if (!posts.length) return <p>Ingen nyheter publisert enda.</p>;

  // Sort posts by timestamp (newest first)
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const mainPosts = sortedPosts.slice(0, 10);
  const archivePosts = sortedPosts.slice(10, 15);

  return (
    <div className="posts-list">
      {mainPosts.map((post, index) => (
        <div key={index} className="preview-box" style={{ position: "relative" }}>
          {onDelete && (
            <button
              className="delete-btn"
              onClick={() => onDelete(post)}
              title="Slett nyhet"
            >
              &times;
            </button>
          )}
          <img
            src={
              post.image ||
              (post.location === "Triaden" ? newsImg2 : newsImg)
            }
            alt=""
            onClick={() => onOpenModal(post)}
            style={{ cursor: "pointer", userSelect: "none", pointerEvents: "auto" }}
            draggable={false}
            tabIndex={-1}
            onContextMenu={e => e.preventDefault()} // Prevent right-click menu
          />
          <div
            className="preview-content"
            onClick={() => onOpenModal(post)}
            style={{ cursor: "pointer" }}
          >
            <div className="news-label-container" aria-label="React Logo and News label">
              <FaNewspaper size={18} color="#20b14c" aria-label="React Logo" />
              <span className="news-label-text">Innlegg</span>
            </div>
            <h3>{post.title || "(Ingen tittel)"}</h3>
            <p className="location">{post.location}</p>
            <small className="date">{formatDate(post.timestamp)}</small>
          </div>
        </div>
      ))}

      {archivePosts.length > 0 && (
        <>
          <button
            className="archive-btn"
            style={{
              marginTop: "24px",
              background: "transparent",
              color: "grey",
              border: "none",
              borderRadius: "0",
              padding: "0",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
              width: "10%",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto"
            }}
            onClick={() => setShowArchive((prev) => !prev)}
          >
            {showArchive ? "- Lukk arkiv ." : "- Åpne arkiv -"}
          </button>
          {showArchive &&
            archivePosts.map((post, index) => (
              <div key={`archive-${index}`} className="preview-box" style={{ position: "relative" }}>
                {onDelete && (
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(post)}
                    title="Slett nyhet"
                  >
                    &times;
                  </button>
                )}
                <img
                  src={
                    post.image ||
                    (post.location === "Triaden" ? newsImg2 : newsImg)
                  }
                  alt=""
                  onClick={() => onOpenModal(post)}
                  style={{ cursor: "pointer", userSelect: "none", pointerEvents: "auto" }}
                  draggable={false}
                  tabIndex={-1}
                  onContextMenu={e => e.preventDefault()} // Prevent right-click menu
                />
                <div
                  className="preview-content"
                  onClick={() => onOpenModal(post)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="news-label-container" aria-label="React Logo and News label">
                    <FaNewspaper size={18} color="#20b14c" aria-label="React Logo" />
                    <span className="news-label-text">Innlegg</span>
                  </div>
                  <h3>{post.title || "(Ingen tittel)"}</h3>
                  <p className="location">{post.location}</p>
                  <small className="date">{formatDate(post.timestamp)}</small>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
