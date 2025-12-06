import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { getPlayerCardData } from "../services/api";

export default function PlayerCardModal({ token, onClose }) {
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);

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

  async function getCardCanvas() {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, { scale: 2 });
    return canvas;
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
      <div className="modal-inner">
        <button onClick={onClose} className="modal-close">
          Close
        </button>

        <div
          id="player-card"
          ref={cardRef}
          style={{
            width: "400px",
            height: "600px",
            padding: "20px",
            background: "#ffffff",
            borderRadius: "16px",
            border: `10px solid ${borderColor}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
            gap: "8px",
          }}
        >
          <img
            src={profileImage}
            alt="profile"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "12px",
              objectFit: "cover",
              marginBottom: "12px",
              border: "4px solid #f0f0f0",
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/default_avatar.png";
            }}
          />

          <h2 style={{ margin: 0 }}>{card.username}</h2>
          <p style={{ margin: 0 }}>ELO: {card.elo}</p>
          <p style={{ margin: 0 }}>Tier: {card.tier}</p>

          <div style={{ display: "flex", margin: "8px 0" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{ fontSize: "24px" }}>
                {i <= (card.star_rating || 0) ? "⭐" : "☆"}
              </span>
            ))}
          </div>

          <p style={{ margin: 0 }}>Region: {card.region || "Unknown"}</p>
          <p style={{ margin: 0 }}>
            Win Rate (Last 10): {Math.round((card.win_rate_last_10 || 0) * 100)}%
          </p>

          {card.best_match && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <p style={{ margin: "4px 0" }}>Best Match:</p>
              <p style={{ margin: "4px 0" }}>
                {card.best_match.winner_username} vs {card.best_match.loser_username}
              </p>
              <p style={{ margin: "4px 0" }}>Scores: {card.best_match.scores}</p>
            </div>
          )}

          <p style={{ marginTop: "12px", fontStyle: "italic", textAlign: "center" }}>
            {bioText}
          </p>
        </div>

        <div className="modal-actions">
          <button onClick={handleDownload} className="primary">
            Download Card
          </button>
          <button onClick={handleShare}>Share Card</button>
        </div>
      </div>
    </div>
  );
}
