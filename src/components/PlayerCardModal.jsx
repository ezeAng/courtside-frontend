import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { getPlayerCardData } from "../services/api";
import PlayerCard3D from "../components/PlayerCard3D";

export default function PlayerCardModal({ token, targetAuthId, onClose }) {
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPlayerCardData(token, targetAuthId);
        setCard(res.card);
      } catch (err) {
        setError(err.message || "Failed to load player card");
      }
    })();
  }, [token, targetAuthId]);

  async function getCardCanvas() {
    if (!cardRef.current) return null;

    const el = cardRef.current;

    // Save current styles
    const prevTransform = el.style.transform;
    const prevTransition = el.style.transition;
    const prevPointerEvents = el.style.pointerEvents;

    // 🔒 Freeze the card
    el.style.transform = "none";
    el.style.transition = "none";
    el.style.pointerEvents = "none";

    // Give browser a frame to apply styles
    await new Promise((r) => requestAnimationFrame(r));

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      proxy: process.env.REACT_APP_HTML2CANVAS_PROXY,
    });

    // 🔓 Restore styles
    el.style.transform = prevTransform;
    el.style.transition = prevTransition;
    el.style.pointerEvents = prevPointerEvents;

    return canvas;
  }


  async function handleDownload() {
    const canvas = await getCardCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${card.username}_player_card.png`;
    link.click();
  }

  async function handleShare() {
    const canvas = await getCardCanvas();
    if (!canvas) return;

    const blob = await new Promise((r) => canvas.toBlob(r));
    if (!blob) return handleDownload();

    const file = new File([blob], `${card.username}_card.png`, {
      type: "image/png",
    });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "My Player Card",
        text: "Check out my Courtside player card!",
        files: [file],
      });
    } else {
      handleDownload();
    }
  }

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

  return (
    <div className="modal-overlay">
      <div className="modal-inner">
        <button onClick={onClose} className="modal-close">
          Close
        </button>

        <div
          ref={cardRef}
          style={{
            display: "inline-block",
            padding: "8px",        // safety margin
            background: "transparent",
          }}
        >
          <PlayerCard3D card={card} />
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
