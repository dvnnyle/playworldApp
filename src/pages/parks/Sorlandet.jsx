import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import '../../style/global.css';
import '../../style/Sor.css';
import pwsImage from '../../assets/pws.png';
import bdImage from '../../assets/bdimage.webp';
import { FaInstagram, FaFacebookF, FaTiktok, FaGlobe } from 'react-icons/fa';
import trampoline from '../../assets/trampoline.webp'; // Add this import at the top with your other imports

export default function Sor() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <div className="global-rectangle">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FiArrowLeft size={24} />
        </button>

        <h1 className="global-title">SØRLANDET</h1>
      </div>

      <div className="content-wrapper">
        <div className="park-card">
          <img
            src={pwsImage}
            alt="PWS building"
            className="park-image"
            draggable={false}
            onContextMenu={e => e.preventDefault()}
          />
        </div>

        <div className="social-icons" style={{ gap: '15px' }}>
          <a
            href="https://www.instagram.com/playworld.kristiansand"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FaFacebookF size={24} />
          </a>
          <a
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <FaTiktok size={24} />
          </a>
          <a
            href="https://www.playworld.no"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
          >
            <FaGlobe size={24} />
          </a>
        </div>

        <h3 className="park-subtitle">PLAYWORLD SØRLANDET</h3>

        <div className="park-card">
          <h2 className="park-title">OM OSS</h2>
          <p className="park-description">
            Playworld Sørlandet er et innendørs aktivitetssenter i Kristiansand, lokalisert på Sørlandssenteret. Senteret tilbyr et bredt utvalg av aktiviteter for både barn og voksne, inkludert trampoliner, minigolf, digitale spill og en ninja-løype. Det er et populært valg for bursdagsfeiringer og familiebesøk.
          </p>
        </div>

        <div className="park-card">
          <h2 className="park-title">BURSDAGSFEIRING</h2>
          <img
            src={bdImage}
            alt="Bursdagsfeiring"
            className="birthday-image"
            draggable={false}
            onContextMenu={e => e.preventDefault()}
          />
          <button
            className="bd-btn"
            onClick={() => window.open("https://playworld.no/bursdagsfeiring-barnebursdag-lekeland/", "_blank")}
          >
            Bestill her
          </button>
          <p className="park-description">
            Gjør bursdagen ekstra spesiell hos Playworld Sørlandet! Vi tilbyr egne bursdagspakker med aktiviteter, mat og moro for barn i alle aldre. Kontakt oss for booking og mer informasjon om våre bursdagstilbud.
          </p>
        </div>

        {/* New card: FASILITETER */}
        <div className="park-card">
          <h2 className="park-title">FASILITETER</h2>
          <p className="park-description">
            Playworld Sørlandet har moderne fasiliteter som inkluderer kafé med mat og drikke, sitteområder for foreldre, garderober, gratis WiFi og gode parkeringsmuligheter.
            Her finner du lekeland, trampolinepark, minigolf, digitale spill og en spennende ninja-løype. Vi har også et eget område for de minste barna, slik at hele familien kan ha det gøy sammen.
                   <div className="park-facility-images">
            <img src={trampoline} alt="Trampoline" draggable={false} onContextMenu={e => e.preventDefault()} />
            <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=200&q=80" alt="Fasilitet 2" draggable={false} onContextMenu={e => e.preventDefault()} />
            <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=200&q=80" alt="Fasilitet 3" draggable={false} onContextMenu={e => e.preventDefault()} />
          </div>
          
          
            <h4>LEKELAND | TRAMPOLINER | MINIGOLF | GAMING | DIGITALE SPILL | NINJA-LØYPE</h4>
          </p>
 
        </div>

        <div className="park-card">
          <h2 className="park-title">TILBUD & ARRANGEMENTER</h2>
          <p className="park-description">
            Vi tilbyr spesielle pakker for bursdager, skoleklasser og grupper. Kontakt oss for mer informasjon om våre arrangementer og kampanjer!
          </p>
        </div>


        <div className="park-card">
  <div className="park-loc">
    <strong>ÅPNINGSTIDER</strong>
    <p className="info-text">
      Mandag - Fredag | 10-21 <br /> Lørdag - Søndag | 10-19
    </p>
    <br />
    <strong>LOKASJON</strong>
    <p className="info-text">
      <span style={{ fontSize: '1.2rem', fontStyle: 'normal' }}>
        Sørlandssenteret
      </span>
      <br />
      Barstølveien 35, 4636 Kristiansand
    </p>
    <br />
    <strong>KONTAKT</strong>
    <p className="info-text">
      Telefon:{" "}
      <a href="tel:94467290" style={{ color: "#20b14c", textDecoration: "none" }}>
        944 67 290
      </a>
      <br />
      E-Post:{" "}
      <a href="mailto:post@playworld.no" style={{ color: "#20b14c", textDecoration: "none" }}>
        post@playworld.no
      </a>
    </p>
  </div>
        </div>

        <hr style={{ marginTop:"20px", marginBottom:"20px", width: "50%", border: "none", borderTop: "1.5px solid #e0e0e0" }} />
        <div style={{ textAlign: 'center'}}>
          <button
            className="tickets-btn"
            onClick={() => navigate('/products')}
          >
            BILETTER
          </button>
        </div>

        <div className="social-icons" style={{ gap: '15px' }}></div>
      </div>
    </div>
  );
}
