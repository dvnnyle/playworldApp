import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import '../../style/global.css';
import '../../style/Sor.css';
import pwsImage from '../../assets/pws.png';
import { FaInstagram, FaFacebookF, FaTiktok, FaGlobe } from 'react-icons/fa';

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
            href="https://www.instagram.com/playworld"
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
            </p> <br />
                      <strong>KONTAKT</strong>
            <p className="info-text">
              Telefon: 944 67 290
              <br /> E-Post: post@playworld.no


            </p>
          </div>
        </div>

    <div style={{ textAlign: 'center', margin: '15px 0' }}>
      <button
        className="tickets-btn"
        onClick={() => navigate('/products')}
      >
        Biletter
      </button>
    </div>

  <div className="social-icons" style={{ gap: '15px' }}></div>
      </div>
    </div>
  );
}
