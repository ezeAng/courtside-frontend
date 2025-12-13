// src/components/PlayerCard.js
import { forwardRef } from "react";

/* -------------------- STYLE LOGIC -------------------- */

// ELO → base color
function getEloBase(elo) {
  if (elo >= 1200) {
    return {
      background: "linear-gradient(135deg, #2a003f, #14001f)",
      accent: "#c77dff",
    };
  }
  if (elo >= 1000) {
    return {
      background: "linear-gradient(135deg, #0b2a3f, #06131f)",
      accent: "#4bf0ff",
    };
  }
  if (elo >= 800) {
    return {
      background: "linear-gradient(135deg, #3f2f00, #1f1700)",
      accent: "#ffd166",
    };
  }
  return {
    background: "linear-gradient(135deg, #2a1c0f, #140c05)",
    accent: "#cd7f32",
  };
}

// Win rate → glow
function getWinRateGlow(winRate) {
  if (winRate >= 0.75) return 0.9;
  if (winRate >= 0.6) return 0.6;
  if (winRate >= 0.4) return 0.35;
  return 0.15;
}

// Tier → border
function getTierBorder(tier, accent) {
  switch (tier) {
    case "Diamond":
      return {
        width: 8,
        style: "solid",
        color: accent,
        glow: `0 0 18px ${accent}`,
      };
    case "Platinum":
      return {
        width: 7,
        style: "solid",
        color: "#e5e4e2",
        glow: "0 0 14px rgba(229,228,226,0.8)",
      };
    case "Gold":
      return {
        width: 6,
        style: "solid",
        color: "#ffd700",
        glow: "0 0 12px rgba(255,215,0,0.8)",
      };
    case "Silver":
      return {
        width: 5,
        style: "solid",
        color: "#c0c0c0",
        glow: "0 0 8px rgba(192,192,192,0.6)",
      };
    default:
      return {
        width: 4,
        style: "solid",
        color: "#cd7f32",
        glow: "none",
      };
  }
}

function normalizeProfileImage(profileImage) {
  if (!profileImage) return "/default_avatar.png";
  if (/^https?:\/\//i.test(profileImage)) return profileImage;
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
  return `${backendUrl}${profileImage.startsWith("/") ? profileImage : `/${profileImage}`}`;
}

/* -------------------- COMPONENT -------------------- */

const PlayerCard = forwardRef(({ card }, ref) => {
  const winRate = card.win_rate_last_10 || 0;
  const stars = card.star_rating || 0;

  const eloTheme = getEloBase(card.elo);
  const glowStrength = getWinRateGlow(winRate);
  const border = getTierBorder(card.tier, eloTheme.accent);

  return (
    <div
      ref={ref}
      style={{
        width: "320px",
        padding: "14px",
        borderRadius: "14px",
        position: "relative",
        overflow: "hidden",
        color: "#f5f7fa",
        fontFamily: "'Verdana', sans-serif",

        background: eloTheme.background,

        border: `${border.width}px ${border.style} ${border.color}`,

        boxShadow: `
          ${border.glow},
          0 0 ${20 + glowStrength * 40}px rgba(0,0,0,0.6),
          0 12px 30px rgba(0,0,0,0.6)
        `,
      }}
    >
      {/* INNER ACCENT (stars / prestige) */}
      {stars >= 3 && (
        <div
          style={{
            position: "absolute",
            inset: 6,
            borderRadius: "10px",
            boxShadow:
              stars === 5
                ? `inset 0 0 18px ${eloTheme.accent}`
                : `inset 0 0 10px rgba(255,255,255,0.25)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, letterSpacing: 1, opacity: 0.8 }}>
          PLAYER CARD
        </span>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{card.elo} ELO</span>
      </div>

      {/* IMAGE FRAME */}
        <div
          style={{
            width: "97%",
            margin: "auto",
            height: "220px",
            borderRadius: "12px",
            marginBottom: "10px",
            position: "relative",
            background: "#000",

            /* Outer frame */
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.15)",
          }}
        >
          {/* HARD MASK (this is the key layer) */}
          <div
            style={{
              position: "absolute",
              inset: "4px",          // 🔒 hard safety margin
              borderRadius: "8px",
              overflow: "hidden",
              background: "#000",
            }}
          >
            {/* IMAGE WRAPPER */}
            <div
              style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <img
                src={normalizeProfileImage(card.profile_image_url)}
                alt="profile"
                crossOrigin="anonymous"
                style={{
                  width: "104%",        // 🔒 intentionally oversized
                  height: "104%",
                  objectFit: "cover",
                  transform: "translate(-2%, -2%) translateZ(0)",
                  backfaceVisibility: "hidden",
                  willChange: "transform",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>



      {/* NAME */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{card.username}</h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
          Tier: {card.tier}
        </p>
      </div>

      {/* STARS */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            style={{
              fontSize: 18,
              opacity: i <= stars ? 1 : 0.3,
              filter:
                i <= stars ? `drop-shadow(0 0 4px ${eloTheme.accent})` : "none",
            }}
          >
            {i <= stars ? "⭐" : "☆"}
          </span>
        ))}
      </div>

      {/* STATS PANEL */}
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          color: "#111",
          borderRadius: "8px",
          padding: "10px",
          fontSize: "13px",
        }}
      >
        <p style={{ margin: "4px 0" }}>
          <strong>Region:</strong> {card.region || "Unknown"}
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Win Rate:</strong> {Math.round(winRate * 100)}%
        </p>
        <p
          style={{
            marginTop: "6px",
            fontStyle: "italic",
            fontSize: "12px",
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          {card.bio || "No bio provided."}
        </p>
      </div>
    </div>
  );
});

export default PlayerCard;
