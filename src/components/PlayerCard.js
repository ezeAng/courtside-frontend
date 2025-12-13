// src/components/PlayerCard.js
import { forwardRef } from "react";

const tierColors = {
  Bronze: "#CD7F32",
  Silver: "#C0C0C0",
  Gold: "#FFD700",
  Platinum: "#E5E4E2",
  Diamond: "#4BF0FF",
};

function normalizeProfileImage(profileImage) {
  if (!profileImage) return "/default_avatar.png";

  if (/^https?:\/\//i.test(profileImage) || /^\/\//.test(profileImage)) {
    return profileImage;
  }

  try {
    const url = new URL(profileImage);
    if (url.protocol) return profileImage;
  } catch (_) {}

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
  const normalizedPath = profileImage.startsWith("/")
    ? profileImage
    : `/${profileImage}`;

  return `${backendUrl}${normalizedPath}` || "/default_avatar.png";
}

const PlayerCard = forwardRef(({ card, backgroundColor }, ref) => {
  const borderColor = tierColors[card.tier] || "#ffffff";
  const profileImage = normalizeProfileImage(card.profile_image_url);
  const bioText = card.bio || "This player has not added a bio yet.";

  return (
    <div
      id="player-card"
      ref={ref}
      style={{
        width: "100%",
        height: "140%",
        padding: "14px",
        background: backgroundColor,
        borderRadius: "12px",
        border: `8px solid ${borderColor}`,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        fontFamily: "'Verdana', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        <span style={{ fontSize: "18px" }}>Player Card</span>
        <span style={{ color: "#cc0000" }}>{card.elo} ELO</span>
      </div>

      {/* Image */}
      <div
        style={{
          width: "100%",
          height: "230px",
          background: "#fff5ce",
          border: "4px solid #d4b84f",
          borderRadius: "6px",
          marginBottom: "8px",
          overflow: "hidden",
        }}
      >
        <img
          crossOrigin="anonymous"
          src={profileImage}
          alt="profile"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.src = "/default_avatar.png";
          }}
        />
      </div>

      {/* Name */}
      <div style={{ textAlign: "center", marginBottom: "6px" }}>
        <h2 style={{ margin: 0, fontSize: "20px" }}>{card.username}</h2>
        <p style={{ margin: 0, fontSize: "14px" }}>Tier: {card.tier}</p>
      </div>

      {/* Stars */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ fontSize: "22px" }}>
            {i <= (card.star_rating || 0) ? "⭐" : "☆"}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div
        style={{
          background: "#fffce4",
          border: "2px solid #c9b04a",
          borderRadius: "6px",
          padding: "10px",
          fontSize: "14px",
        }}
      >
        <p>Region: {card.region || "Unknown"}</p>
        <p>
          Win Rate (Last 10):{" "}
          {Math.round((card.win_rate_last_10 || 0) * 100)}%
        </p>
        <p
          style={{
            marginTop: "4px",
            fontStyle: "italic",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          {bioText}
        </p>
      </div>
    </div>
  );
});

export default PlayerCard;
