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
  const normalizedProfileImage = (() => {
    const profileImage = card.profile_image_url;

    if (!profileImage) return "/default_avatar.png";

    if (/^https?:\/\//i.test(profileImage)) {
      return profileImage.replace(/^http:\/\//i, "https://");
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
    const normalizedPath = profileImage.startsWith("/")
      ? profileImage
      : `/${profileImage}`;

    return `${backendUrl}${normalizedPath}` || "/default_avatar.png";
  })();
  const bioText = card.bio || "This player has not added a bio yet.";

  async function getCardCanvas() {
    if (!cardRef.current) return null;
    const html2canvasOptions = {
      scale: 2,
      useCORS: true,
    };

    if (process.env.REACT_APP_HTML2CANVAS_PROXY) {
      html2canvasOptions.proxy = process.env.REACT_APP_HTML2CANVAS_PROXY;
    }

    const canvas = await html2canvas(cardRef.current, html2canvasOptions);
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
            width: "100%",
            height: "140%",
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
            <span style={{ fontSize: "18px", fontWeight: "600" }}>Player Card</span>

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
              crossOrigin="anonymous"
              src={normalizedProfileImage}
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
