import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/global.css';
import '../style/Home.css';
import pwsImage from '../assets/pws.png';
import logo from '../assets/logo.png';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <div className="global-rectangle">
        <h1 className="global-title">VÅRE PARKER</h1>
      </div>

   <div className="logo">
      <img src={logo} alt="logo" />
    </div>

    
      <div className="park-section">

        <div 
          className="rectangle-card" 
          onClick={() => navigate('/sor')} 
          style={{ cursor: 'pointer' }}
          role="button" 
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter') navigate('/sor') }}
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
          onClick={() => navigate('/triaden')} 
          style={{ cursor: 'pointer' }}
          role="button" 
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter') navigate('/triaden') }}
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
            📍 TRIADEN <span className="subtitle" style={{ userSelect: "none", pointerEvents: "none" }}>LØRENSKOG</span>
          </h2>
        </div>

      </div>
    </div>
  );
}
