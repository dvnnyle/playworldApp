import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/global.css';
import '../style/Home.css';
import pwsImage from '../assets/pws.png';
import triImage from '../assets/Triaden.webp';


function ProfileCardButton({ emoji, label, to, vibrate = 10 }) {
  const navigate = useNavigate();
  return (
    <div
      className="profile-card-button"
      onClick={() => {
        window.navigator.vibrate?.(vibrate);
        navigate(to);
      }}
      tabIndex={0}
      role="button"
      onKeyPress={e => {
        if (e.key === "Enter" || e.key === " ") {
          window.navigator.vibrate?.(vibrate);
          navigate(to);
        }
      }}
    >
      <div className="emoji-square">{emoji}</div>
      <h3>{label}</h3>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <div className="global-rectangle">
        <h1 className="global-title">VÅRE PARKER</h1>
      </div>

  
      <div className="park-section">
        <div 
          className="rectangle-card" 
          onClick={() => {
            window.navigator.vibrate?.(10);
            navigate('/Sorlandet');
          }} 
          style={{ cursor: 'pointer' }}
          role="button" 
          tabIndex={0}
          onKeyPress={(e) => { 
            if (e.key === 'Enter') {
              window.navigator.vibrate?.(10);
              navigate('/Sorlandet');
            }
          }}
        >
          <img 
            src={pwsImage} 
            alt="PWS building" 
            className="rectangle-image" 
            draggable={false}
            onContextMenu={e => e.preventDefault()}
            style={{ userSelect: 'none' }}
          />
          <h2
            className="image-title"
            draggable={false}
            tabIndex={-1}
            style={{ userSelect: "none", pointerEvents: "none" }}
            onContextMenu={e => e.preventDefault()}
          >
            📍 SØRLANDET <span className="subtitle" style={{ userSelect: "none", pointerEvents: "none" }}>KRISTIANSAND</span>
          </h2>
        </div>

        <div 
          className="rectangle-card" 
          onClick={() => {
            window.navigator.vibrate?.(10);
            navigate('/triaden');
          }} 
          style={{ cursor: 'pointer' }}
          role="button" 
          tabIndex={0}
          onKeyPress={(e) => { 
            if (e.key === 'Enter') {
              window.navigator.vibrate?.(10);
              navigate('/triaden');
            }
          }}
        >
          <img 
            src={triImage} 
            alt="PWS building" 
            className="rectangle-image" 
            draggable={false}
            onContextMenu={e => e.preventDefault()}
            style={{ userSelect: 'none' }}
          />
          <h2
            className="image-title"
            draggable={false}
            tabIndex={-1}
            style={{ userSelect: "none", pointerEvents: "none" }}
            onContextMenu={e => e.preventDefault()}
          >
            📍 TRIADEN <span className="subtitle" style={{ userSelect: "none", pointerEvents: "none" }}>LØRENSKOG</span>
          </h2>
        </div>
      </div>

      {/* Profile-style card buttons on Home page */}
      <hr style={{ width: "50%", margin: "20px auto 10px auto" }} />
      <div className="home-cards-wrapper" style={{ marginTop: 20 }}>
        <ProfileCardButton emoji="💬" label="KUNDESERVICE" to="/support" vibrate={20} />
      </div>
    </div>
  );
}
