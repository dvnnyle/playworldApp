import React from "react";
import { useNavigate } from 'react-router-dom';
import "./Support.css";
import { FiArrowLeft } from 'react-icons/fi';
export default function Support() {
  const navigate = useNavigate();

  return (
    <>
      <div className="global-rectangle">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="global-title">TRIADEN</h1>
      </div>

      <div className="support-wrapper">
      

      {/* Info card at the top */}
      <div className="support-info-card">
        <p>
          <span className="support-title">Kontakt oss</span>
          <br />
          Har du spørsmål om billetter, bursdag eller arrangement?  Ta kontakt med oss – vi hjelper deg gjerne!
        </p>
      </div>
  <hr style={{ margin: "30px auto", width: "50%" }} />
      <div className="support-container">
        <h2 className="support-title">📍 SØRLANDET</h2>
        <h3 className="support-subtitle">Kristiansand</h3>
        <hr />
        <div className="support-row">
          <strong>E-post:</strong>{" "}
          <a href="mailto:post@playworld.no" className="support-link">
            post@playworld.no
          </a>
        </div>
        <div className="support-row">
          <strong>Telefon:</strong>{" "}
          <a href="tel:94467290" className="support-link">
            944 67 290
          </a>
        </div>
      </div>

      <div className="support-container">
        <h2 className="support-title">📍 TRIDADEN</h2>
        <h3 className="support-subtitle">Lørenskog</h3>
        <hr />
        <div className="support-row">
          <strong>E-post:</strong>{" "}
          <a href="mailto:post@playworldtriaden.no" className="support-link">
            post@playworldtriaden.no
          </a>
        </div>
        <div className="support-row">
          <strong>Telefon :</strong>{" "}
          <a href="tel:92951797" className="support-link">
            929 51 797
          </a>
        </div>
      </div>
<hr style={{ marginTop: "30px", width: "50%" }} />
      {/* Info card about retur at the bottom */}
<h2
  className="support-title"
  style={{
    marginTop: 10,
    textAlign: "center",
    color: "#fff",
  }}
>
  FAQ
</h2>

            <div className="support-info-card" style={{ marginTop: 10 }}>
        <p>
          <span className="support-title">Viktig informasjon</span>
          <br />
          For deg som skal bruke våre trampoliner er det påbud med antiskli-sokker. Disse kan kjøpes i resepsjonen for 40 kr. Vi anbefaler å ta med egne sokker, da dette er en kostnad som påløper ved hver besøk.
       </p>
      </div>
            <div className="support-info-card" style={{ marginTop: 10 }}>
        <p>
          <span className="support-title">Retur og refusjon</span>
          <br />
          For spørsmål om retur eller refusjon av billetter, vennligst kontakt oss på e-post. Vi hjelper deg med din sak så raskt som mulig.
        </p>
      </div>
    </div>
    </>
  );
}