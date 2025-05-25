import React, { useEffect, useState, useCallback } from "react";
import "./prompter.css";

export function usePwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleClose = useCallback(() => setShowPrompt(false), []);

  return { showPrompt, handleInstall, handleClose };
}

export default function Prompter({ show, onInstall, onClose }) {
  if (!show) return null;

  return (
    <div className="prompter-overlay">
      <div className="prompter-modal">
        <h2 className="prompter-title">Installer Playworld App</h2>
        <p className="prompter-desc">
          Få en bedre opplevelse ved å installere Playworld som en app på din enhet.
        </p>
        <div className="prompter-btn-row">
          <button className="prompter-install-btn" onClick={onInstall}>
            Installer
          </button>
          <button className="prompter-cancel-btn" onClick={onClose}>
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
}