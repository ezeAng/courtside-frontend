// src/components/PlayerCard.js
import { forwardRef } from "react";
import { alpha } from "@mui/material/styles";
import { normalizeProfileImage } from "../utils/profileImage";
import { themeColors, themeFonts } from "../theme/tokens";

/* -------------------- STYLE LOGIC -------------------- */

// ELO → base color
function getEloBase(elo) {
  if (elo >= 1200) {
    return themeColors.playerCard.tiers.elite;
  }
  if (elo >= 1000) {
    return themeColors.playerCard.tiers.pro;
  }
  if (elo >= 800) {
    return themeColors.playerCard.tiers.contender;
  }
  return themeColors.playerCard.tiers.challenger;
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
        color: themeColors.playerCard.borders.diamond,
        glow: `0 0 14px ${alpha(themeColors.playerCard.borders.diamond, 0.8)}`,
      };
    case "Gold":
      return {
        width: 6,
        style: "solid",
        color: themeColors.playerCard.borders.gold,
        glow: `0 0 12px ${alpha(themeColors.playerCard.borders.gold, 0.8)}`,
      };
    case "Silver":
      return {
        width: 5,
        style: "solid",
        color: themeColors.playerCard.borders.silver,
        glow: `0 0 8px ${alpha(themeColors.playerCard.borders.silver, 0.6)}`,
      };
    default:
      return {
        width: 4,
        style: "solid",
        color: themeColors.playerCard.borders.bronze,
        glow: "none",
      };
  }
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
        color: themeColors.playerCard.textLight,
        fontFamily: themeFonts.accent,

        background: eloTheme.background,

        border: `${border.width}px ${border.style} ${border.color}`,

        boxShadow: `
          ${border.glow},
          0 0 ${20 + glowStrength * 40}px ${alpha(themeColors.playerCard.frame, 0.6)},
          0 12px 30px ${alpha(themeColors.playerCard.frame, 0.6)}
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
            background: themeColors.playerCard.frame,

            /* Outer frame */
            boxShadow: `inset 0 0 0 2px ${alpha(
              themeColors.playerCard.textLight,
              0.15
            )}`,
          }}
        >
          {/* HARD MASK (this is the key layer) */}
          <div
            style={{
              position: "absolute",
              inset: "4px",          // 🔒 hard safety margin
              borderRadius: "8px",
              overflow: "hidden",
              background: themeColors.playerCard.frame,
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
          background: themeColors.playerCard.panel,
          color: themeColors.playerCard.textDark,
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
