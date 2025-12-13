import { useRef, useState } from "react";
import PlayerCard from "./PlayerCard";

/* ---------------------------------------------
   Neutral sheen material (NO rainbow)
---------------------------------------------- */
function getSheen(glareX = 50, glareY = 50) {
  return {
    backgroundImage: `
      /* Primary soft sheen */
      linear-gradient(
        120deg,
        rgba(255,255,255,0.25),
        rgba(255,255,255,0.05),
        rgba(255,255,255,0.25)
      ),

      /* Fine grain texture */
      repeating-radial-gradient(
        circle,
        rgba(255,255,255,0.03) 0px,
        rgba(255,255,255,0.03) 1px,
        transparent 1px,
        transparent 3px
      )
    `,
    backgroundSize: "200% 200%, 6px 6px",
    backgroundPosition: `${glareX}% ${glareY}%, center`,
  };
}

export default function PlayerCard3D({ card }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({});
  const [sheen, setSheen] = useState({});
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  function update(clientX, clientY) {
    const r = ref.current.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;

    const rx = -(y - r.height / 2) / 20;
    const ry = (x - r.width / 2) / 20;

    const gx = (x / r.width) * 100;
    const gy = (y / r.height) * 100;

    setRotation({ x: rx, y: ry });

    setTilt({
      transform: `
        rotateX(${rx}deg)
        rotateY(${ry}deg)
        scale(1.03)
      `,
    });

    setSheen(getSheen(gx, gy));
  }

  function reset() {
    setTilt({ transform: "rotateX(0) rotateY(0) scale(1)" });
    setSheen({});
    setRotation({ x: 0, y: 0 });
  }

  return (
    <div style={{ perspective: "1200px" }}>
      <div
        ref={ref}
        onMouseMove={(e) => update(e.clientX, e.clientY)}
        onMouseLeave={reset}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) update(t.clientX, t.clientY);
        }}
        onTouchEnd={reset}
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.12s ease-out",
          ...tilt,
        }}
      >
        {/* CARD BASE */}
        <PlayerCard card={card} />

        {/* SHEEN LAYER (inside card, clipped) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "14px",
            pointerEvents: "none",
            mixBlendMode: "soft-light",
            opacity: 0.6,
            zIndex: 2,
            ...sheen,
          }}
        />

        {/* SPECULAR HIGHLIGHT */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "14px",
            pointerEvents: "none",
            zIndex: 3,
            background: `
              linear-gradient(
                120deg,
                transparent 45%,
                rgba(255,255,255,0.5),
                transparent 55%
              )
            `,
            mixBlendMode: "soft-light",
            opacity: 0.35,
            transform: `
              translateX(${rotation.y * 1.2}px)
              rotateZ(${rotation.y * 0.25}deg)
            `,
          }}
        />
      </div>
    </div>
  );
}
