import { useEffect, useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@500;700;900&display=swap');

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-2deg); }
    50%       { transform: translateY(-13px) rotate(2deg); }
  }
  @keyframes bobBook1 {
    0%, 100% { transform: rotate(-14deg) translateY(0); }
    50%       { transform: rotate(-14deg) translateY(-6px); }
  }
  @keyframes bobBook2 {
    0%, 100% { transform: rotate(6deg) translateY(0); }
    50%       { transform: rotate(6deg) translateY(-9px); }
  }
  @keyframes bobBook3 {
    0%, 100% { transform: rotate(-6deg) translateY(0); }
    50%       { transform: rotate(-6deg) translateY(-5px); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.96); box-shadow: 0 0 0 0 rgba(139,163,105,0.55); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 16px rgba(139,163,105,0); }
    100% { transform: scale(0.96); box-shadow: 0 0 0 0 rgba(139,163,105,0); }
  }
  @keyframes iconDrift {
    0%, 100% { transform: translateY(0) rotate(var(--r,0deg)); opacity: 0.18; }
    50%       { transform: translateY(-8px) rotate(var(--r,0deg)); opacity: 0.28; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .mascot-card-root * { box-sizing: border-box; }
  .mascot-card-root   { font-family: 'Nunito', sans-serif; }
  .mascot-float  { animation: float 3.8s ease-in-out infinite; }
  .pulse-ring    { animation: pulse-ring 2.6s ease-out infinite; }
  .bob1          { animation: bobBook1 3s   ease-in-out infinite; }
  .bob2          { animation: bobBook2 3.6s ease-in-out infinite 0.3s; }
  .bob3          { animation: bobBook3 2.8s ease-in-out infinite 0.6s; }
  .fade-up       { animation: fadeSlideUp 0.75s ease both; }
  .icon-drift    { animation: iconDrift 4.2s ease-in-out infinite; }
`;

function IconDrift({ icon, style }) {
  return (
    <span
      className="material-symbols-outlined icon-drift"
      style={{
        position: "absolute",
        fontSize: 46,
        color: "#3d5c2e",
        opacity: 0.18,
        pointerEvents: "none",
        ...style,
      }}
    >
      {icon}
    </span>
  );
}

export default function MascortCard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      <style>{STYLES}</style>

      {/* Card — width fills the 40% left panel, capped sensibly */}
      <div
        className={`mascot-card-root ${mounted ? "fade-up" : ""}`}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          borderRadius: 34,
          overflow: "hidden",
          background: "linear-gradient(160deg, #dce8cc 0%, #b5c99a 40%, #8aab72 100%)",
          boxShadow: "0 24px 60px rgba(100,130,72,0.28), 0 2px 18px rgba(0,0,0,0.09)",
          padding: "48px 36px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {/* Drifting background icons */}
        <IconDrift icon="coffee"       style={{ top: 16,    left: 16,   "--r": "10deg",  animationDelay: "0s"   }} />
        <IconDrift icon="lightbulb"    style={{ top: 16,    right: 20,  "--r": "-12deg", animationDelay: "0.5s" }} />
        <IconDrift icon="edit"         style={{ bottom: 130, left: 12,  "--r": "8deg",   animationDelay: "1.0s" }} />
        <IconDrift icon="auto_awesome" style={{ bottom: 90,  right: 16, "--r": "-10deg", animationDelay: "0.3s" }} />
        <IconDrift icon="menu_book"    style={{ top: "44%",  left: 8,   "--r": "0deg",   animationDelay: "1.4s" }} />
        <IconDrift icon="draw"         style={{ top: "50%",  right: 6,  "--r": "6deg",   animationDelay: "0.8s" }} />

        {/* Mascot circle */}
        <div
          className="pulse-ring"
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.32)",
            backdropFilter: "blur(10px)",
            border: "4px solid rgba(255,255,255,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="mascot-float" style={{ width: 158, height: 158 }}>
            <img
              src="https://openmoji.org/data/color/svg/1F4DA.svg"
              alt="Books mascot"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 6px 14px rgba(60,90,40,0.22))",
              }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div style={{ display: "none", fontSize: 96, alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
              📚
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: 36,
            color: "#2e4820",
            margin: "0 0 10px",
            letterSpacing: 0.4,
            lineHeight: 1.15,
            zIndex: 1,
            position: "relative",
            textShadow: "0 1px 6px rgba(255,255,255,0.35)",
          }}
        >
          Ready to write?
        </h2>

        {/* Sub-text */}
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#3d5a2a",
            margin: "0 0 32px",
            lineHeight: 1.65,
            maxWidth: 260,
            zIndex: 1,
            position: "relative",
          }}
        >
          Your magical library of stories is just one click away!
        </p>

        {/* Decorative book spines */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", zIndex: 1, position: "relative" }}>
          {[
            { h: 56, bg: "#f5f0e8", border: "#d6ccb4", cls: "bob1" },
            { h: 70, bg: "#c9b99a", border: "#a89070", cls: "bob2" },
            { h: 48, bg: "#7a9e6a", border: "#5a7e4e", cls: "bob3" },
          ].map(({ h, bg, border, cls }, i) => (
            <div
              key={i}
              className={cls}
              style={{
                width: 36,
                height: h,
                borderRadius: 8,
                background: bg,
                border: `3px solid ${border}`,
                boxShadow: "0 5px 14px rgba(60,80,40,0.18)",
              }}
            />
          ))}
        </div>

        {/* Badge pill */}
        <div
          style={{
            marginTop: 28,
            background: "rgba(255,255,255,0.38)",
            backdropFilter: "blur(6px)",
            borderRadius: 999,
            padding: "8px 22px",
            fontSize: 13,
            fontWeight: 900,
            color: "#2e4820",
            letterSpacing: 1.4,
            textTransform: "uppercase",
            border: "1.5px solid rgba(255,255,255,0.55)",
            zIndex: 1,
            position: "relative",
          }}
        >
          🌿 Start Writing Today
        </div>
      </div>
    </>
  );
}