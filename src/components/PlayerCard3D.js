import { useRef, useState } from "react";
import PlayerCard from "./PlayerCard";

function getCardTheme(elo) {
  if (elo >= 1000) {
    return {
      rarity: "diamond",
      background: "linear-gradient(135deg, #dff6ff, #b8ecff)",
    };
  }

  return {
    rarity: "bronze",
    background: "linear-gradient(135deg, #f7e27c, #e2b75c)",
  };
}
function getFoilStyle(rarity, glareX = 50, glareY = 50) {
  if (rarity === "diamond") {
    return {
      backgroundImage: `
        linear-gradient(
          115deg,
          rgba(255,255,255,0.05),
          rgba(0,220,255,0.35),
          rgba(180,120,255,0.35),
          rgba(255,255,255,0.05)
        ),
        repeating-linear-gradient(
          45deg,
          rgba(255,255,255,0.06) 0px,
          rgba(255,255,255,0.06) 1px,
          transparent 1px,
          transparent 3px
        )
      `,
      backgroundSize: "200% 200%, 4px 4px",
      backgroundPosition: `${glareX}% ${glareY}%, center`,
    };
  }

  // Bronze shimmer
  return {
    backgroundImage: `
      linear-gradient(
        120deg,
        rgba(255,255,255,0.08),
        rgba(255,215,0,0.25),
        rgba(255,255,255,0.08)
      ),
      repeating-linear-gradient(
        60deg,
        rgba(255,255,255,0.05) 0px,
        rgba(255,255,255,0.05) 1px,
        transparent 1px,
        transparent 4px
      )
    `,
    backgroundSize: "180% 180%, 6px 6px",
    backgroundPosition: `${glareX}% ${glareY}%, center`,
  };
}


export default function PlayerCard3D({ card }) {
  const containerRef = useRef(null);
  const [transform, setTransform] = useState({});
  const [glare, setGlare] = useState({});
  const [foil, setFoil] = useState({});

  const { rarity, background } = getCardTheme(card.elo);

  function updateTilt(clientX, clientY) {
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 20;
    const rotateY = (x - centerX) / 20;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;


    setTransform({
      transform: `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.04)
      `,
    });

    setGlare({
      background: `
        radial-gradient(
          circle at ${x}px ${y}px,
          rgba(255,255,255,0.35),
          transparent 60%
        )
      `,
    });

    if (rarity === "diamond") {
      setFoil(
        getFoilStyle(rarity, glareX, glareY)
      );

    } else {
      setFoil({
        background: `
          linear-gradient(
            120deg,
            rgba(255,255,255,0.12),
            rgba(255,215,0,0.25),
            rgba(255,255,255,0.12)
          )
        `,
      });
    }
  }

  function handleMouseMove(e) {
    updateTilt(e.clientX, e.clientY);
  }

  function handleTouchMove(e) {
    const touch = e.touches[0];
    if (!touch) return;
    updateTilt(touch.clientX, touch.clientY);
  }

  function reset() {
    setTransform({
      transform: "rotateX(0) rotateY(0) scale(1)",
    });
    setGlare({});
    setFoil({});
  }

  return (
    <div
      style={{
        perspective: "1200px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={reset}
        onTouchMove={handleTouchMove}
        onTouchEnd={reset}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.12s ease-out",
          position: "relative",
          ...transform,
        }}
      >
        {/* Card */}
        <div style={{ transform: "translateZ(30px)" }}>
          <PlayerCard card={card} backgroundColor={background} />
        </div>

        {/* Foil layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "12px",
            pointerEvents: "none",
            mixBlendMode: "overlay",
            opacity: rarity === "diamond" ? 0.85 : 0.45,
            transition: "background-position 0.1s linear",
            ...foil,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "12px",
            pointerEvents: "none",
            background: `
              linear-gradient(
                120deg,
                transparent 40%,
                rgba(255,255,255,0.35),
                transparent 60%
              )
            `,
            mixBlendMode: "soft-light",
            opacity: rarity === "diamond" ? 0.6 : 0.3,
            transform: `translateX(${transform ? "10px" : "0"})`,
          }}
        />


        {/* Glare layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "12px",
            pointerEvents: "none",
            mixBlendMode: "soft-light",
            ...glare,
          }}
        />
      </div>
    </div>
  );
}
