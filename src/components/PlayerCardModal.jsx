import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { getPlayerCardData } from "../services/api";

export default function PlayerCardModal({ token, onClose }) {
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);
  const cardRef = useRef(null);
  const modalRef = useRef(null);
  const actionsRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getPlayerCardData(token);
        setCard(res.card);
      } catch (err) {
        setError(err.message || "Failed to load player card");
      }
    }

    load();
  }, [token]);

  if (!card) {
    return (
      <div className="modal-overlay">
        <div className="modal-inner">
          <p>{error || "Loading player card..."}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const tierColors = {
    Bronze: "#CD7F32",
    Silver: "#C0C0C0",
    Gold: "#FFD700",
    Platinum: "#E5E4E2",
    Diamond: "#4BF0FF",
  };

  const borderColor = tierColors[card.tier] || "#FFFFFF";
  const profileImage = card.profile_image_url || "/default_avatar.png";
  const bioText = card.bio || "This player has not added a bio yet.";
  const CARD_WIDTH = 390;
  const CARD_HEIGHT = 560;

  useEffect(() => {
    if (!card) return;

    function updateScale() {
      if (!modalRef.current) return;

      const modalRect = modalRef.current.getBoundingClientRect();
      const actionsHeight =
        actionsRef.current?.getBoundingClientRect().height || 0;
      const closeHeight =
        closeButtonRef.current?.getBoundingClientRect().height || 0;

      const availableWidth = modalRect.width;
      const availableHeight = modalRect.height - actionsHeight - closeHeight - 32; // spacing buffer

      const widthScale = availableWidth / CARD_WIDTH;
      const heightScale = availableHeight / CARD_HEIGHT;
      const nextScale = Math.min(1, widthScale, heightScale);

      setScale(nextScale > 0 ? nextScale : 1);
    }

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, [card]);

  async function getCardCanvas() {
    if (!cardRef.current) return null;

    const wrapper = cardRef.current.parentElement;
    const previousTransform = wrapper?.style.transform;

    if (wrapper) {
      wrapper.style.transform = "scale(1)";
    }

    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2 });
      return canvas;
    } finally {
      if (wrapper) {
        wrapper.style.transform = previousTransform || "";
      }
    }
  }

  async function handleDownload() {
    const canvas = await getCardCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${card.username}_player_card.png`;
    link.click();
  }

  async function handleShare() {
    const canvas = await getCardCanvas();
    if (!canvas) return;

    const blob = await new Promise((resolve) => canvas.toBlob(resolve));
    if (!blob) {
      await handleDownload();
      return;
    }

    const file = new File([blob], `${card.username}_card.png`, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "My Player Card",
        text: "Check out my Courtside player card!",
        files: [file],
      });
    } else {
      alert("Sharing not supported on this device. Downloading instead.");
      await handleDownload();
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-inner" ref={modalRef}>
        <button
          onClick={onClose}
          className="modal-close"
          ref={closeButtonRef}
        >
          Close
        </button>

        <div
          className="player-card-scale-wrapper"
          style={{
            width: `${CARD_WIDTH}px`,
            height: `${CARD_HEIGHT}px`,
            maxWidth: "100%",
            maxHeight: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <div
            id="player-card"
            ref={cardRef}
            style={{
              width: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
              padding: "14px",
              background: "#f7e27c", // Pokémon yellow
              borderRadius: "12px",
              border: `8px solid ${borderColor}`,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              fontFamily: "'Verdana', sans-serif",
              position: "relative",
            }}
          >
            {/* ---- TOP HEADER (like Pokémon name + HP) ---- */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                fontSize: "22px",
                fontWeight: "700",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: "600" }}>
                Player Card
              </span>

              <span style={{ color: "#cc0000", fontWeight: "700" }}>
                {card.elo} ELO
              </span>
            </div>

            {/* ---- IMAGE AREA ---- */}
            <div
              style={{
                width: "100%",
                height: "230px",
                background: "#fff5ce",
                border: "4px solid #d4b84f",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "8px",
                overflow: "hidden",
              }}
            >
              <img
                src={profileImage}
                alt="profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default_avatar.png";
                }}
              />
            </div>

            {/* ---- NAME + TIER ---- */}
            <div style={{ textAlign: "center", marginBottom: "6px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
                {card.username}
              </h2>
              <p style={{ margin: 0, fontSize: "14px" }}>Tier: {card.tier}</p>
            </div>

            {/* ---- STAR RATING ---- */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "8px",
              }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ fontSize: "22px" }}>
                  {i <= (card.star_rating || 0) ? "⭐" : "☆"}
                </span>
              ))}
            </div>

            {/* ---- STATS BOX (styled like attack box) ---- */}
            <div
              style={{
                width: "100%",
                background: "#fffce4",
                border: "2px solid #c9b04a",
                borderRadius: "6px",
                padding: "10px",
                fontSize: "14px",
                lineHeight: "1.2",
                marginBottom: "8px",
              }}
            >
              <p style={{ margin: "4px 0" }}>Region: {card.region || "Unknown"}</p>
              <p style={{ margin: "4px 0" }}>
                Win Rate (Last 10): {Math.round((card.win_rate_last_10 || 0) * 100)}%
              </p>
              {/* ---- FLAVOR TEXT ---- */}
              <p
                style={{
                  marginTop: "4px",
                  fontStyle: "italic",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "0 4px",
                  color: "#333",
                }}
              >
                {bioText}
              </p>
              {card.best_match && (
                <div style={{ marginTop: "6px" }}>
                  {/* <strong style={{ display: "block", marginBottom: "2px" }}>
                    Best Match:
                  </strong>
                  <p style={{ margin: "0" }}>
                    {card.best_match.winner_username} vs{" "}
                    {card.best_match.loser_username}
                  </p> */}
                  {/* <p style={{ margin: "0" }}>Scores: {card.best_match.scores}</p> */}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions" ref={actionsRef}>
          <button onClick={handleDownload} className="primary">
            Download Card
          </button>
          <button onClick={handleShare}>Share Card</button>
        </div>
      </div>
    </div>
  );
}
