import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "../../style/global.css";
import "./Support.css";

export default function Support() {
  const formRef = useRef();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const SERVICE_ID = "service_9rql4rf";
  const TEMPLATE_ID = "template_8qx864d";
  const PUBLIC_KEY = "XKept09xH--2ohN23";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await emailjs.sendForm(
        SERVICE_ID,
        TEMPLATE_ID,
        formRef.current,
        PUBLIC_KEY
      );

      if (result.status === 200) {
        setSubmitted(true);
      } else {
        setError("Noe gikk galt. Prøv igjen senere.");
      }
    } catch (err) {
      setError("Kunne ikke sende melding. Sjekk internettforbindelsen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-container">
      <h1 className="support-title">Kundeservice</h1>
      <p className="support-desc">
        Har du spørsmål, problemer eller tilbakemeldinger? Fyll ut skjemaet under, så tar vi kontakt med deg så snart som mulig!
      </p>

      {submitted ? (
        <div className="support-success">
          <strong>Takk for din henvendelse!</strong>
          <p>Vi har mottatt meldingen din og vil svare deg på e-post så snart vi kan.</p>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="support-form">
          <label htmlFor="name">Navn:</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Ditt navn"
          />

          <label htmlFor="email">E-post:</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="din@epost.no"
          />

          <label htmlFor="message">Din melding:</label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            placeholder="Skriv din melding her..."
          />

          <button type="submit" className="support-submit-btn" disabled={loading}>
            {loading ? "Sender..." : "Send inn"}
          </button>

          {error && <p className="support-error">{error}</p>}
        </form>
      )}

      <div className="support-contact-info">
        <h3>Kontaktinformasjon</h3>
        <p>E-post: <a href="mailto:support@dinbedrift.no">support@dinbedrift.no</a></p>
        <p>Telefon: <a href="tel:+4712345678">+47 12 34 56 78</a></p>
      </div>
    </div>
  );
}
