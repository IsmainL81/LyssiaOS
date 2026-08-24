import React, {
  useEffect,
  useState,
} from "react";

export default function ColdStartPortrait() {
  const [
    scene,
    setScene,
  ] = useState("boot");

  useEffect(() => {
    const scenes = [
      {
        name: "boot",
        duration: 3000,
      },
      {
        name: "reveal",
        duration: 4500,
      },
      {
        name: "diagnostics",
        duration: 5500,
      },
      {
        name: "presence",
        duration: 5000,
      },
      {
        name: "signature",
        duration: 4000,
      },
      {
        name: "fade",
        duration: 2000,
      },
    ];

    let cancelled = false;
    let index = 0;
    let timer;

    const advance = () => {
      if (cancelled) {
        return;
      }

      setScene(
        scenes[index].name
      );

      timer = setTimeout(() => {
        index =
          (index + 1) %
          scenes.length;

        advance();
      }, scenes[index].duration);
    };

    advance();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const isVisible =
    scene !== "boot" &&
    scene !== "fade";

  const showDiagnostics =
    scene === "diagnostics";

  const showSignature =
    scene === "signature";

  return (
    <div
      className={`cold-start cold-start-${scene}`}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at center, #172b43 0%, #08090b 72%)",
      }}
    >
      <div
        className="cold-start-pin"
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#dff8ff",
          boxShadow:
            "0 0 18px rgba(89,217,255,0.95), 0 0 55px rgba(89,217,255,0.45)",
          opacity:
            scene === "boot" ||
            scene === "fade"
              ? 1
              : 0.35,
          transform:
            scene === "boot" ||
            scene === "fade"
              ? "scale(1)"
              : "scale(0.65)",
          transition:
            "opacity 900ms ease, transform 900ms ease",
          zIndex: 5,
        }}
      />

      <div
        className="cold-start-portrait"
        style={{
          position: "relative",
          width: "min(58%, 420px)",
          aspectRatio: "3 / 4",
          overflow: "hidden",
          borderRadius: 28,
          opacity: isVisible ? 1 : 0,
          transform:
            scene === "reveal"
              ? "scale(1.08)"
              : scene === "presence"
                ? "scale(1)"
                : scene === "signature"
                  ? "translateX(-8%) scale(0.94)"
                  : "scale(1.04)",
          transition:
            "opacity 1200ms ease, transform 1400ms ease",
          boxShadow:
            "0 0 35px rgba(89,217,255,0.22), 0 0 90px rgba(89,217,255,0.10)",
          border:
            "1px solid rgba(89,217,255,0.38)",
          zIndex: 2,
        }}
      >
        <img
          src="/lyssia-avatar.png"
          alt="Lyssia"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 55%, rgba(8,9,11,0.35) 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 2,
            top:
              scene === "reveal"
                ? "18%"
                : scene === "diagnostics"
                  ? "62%"
                  : "50%",
            background:
              "rgba(89,217,255,0.72)",
            boxShadow:
              "0 0 14px rgba(89,217,255,0.85)",
            opacity:
              scene === "reveal" ||
              scene === "diagnostics"
                ? 1
                : 0,
            transition:
              "top 1800ms ease, opacity 500ms ease",
          }}
        />
      </div>

      {showDiagnostics && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            pointerEvents: "none",
            color: "#9ddff5",
            fontFamily:
              '"IBM Plex Mono", monospace',
            fontSize: 11,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "8%",
              top: "34%",
            }}
          >
            OPTICS
          </div>

          <div
            style={{
              position: "absolute",
              right: "8%",
              top: "46%",
            }}
          >
            NEURAL BUS
          </div>

          <div
            style={{
              position: "absolute",
              left: "12%",
              bottom: "28%",
            }}
          >
            DERMAL LAYER
          </div>
        </div>
      )}

      {showSignature && (
        <div
          style={{
            position: "absolute",
            right: "8%",
            top: "50%",
            transform:
              "translateY(-50%)",
            color: "#e8f8ff",
            zIndex: 4,
            fontFamily:
              "Archivo, sans-serif",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 6,
            }}
          >
            LYSSIA
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              letterSpacing: 2,
              opacity: 0.65,
            }}
          >
            ARTIFICIAL HUMANOID INTELLIGENCE
          </div>
        </div>
      )}
    </div>
  );
}
