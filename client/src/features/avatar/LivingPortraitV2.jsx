import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useLyssia } from "../../core/LyssiaCore";
import portraitImg from "../../assets/lyssia-portrait.png";

/**
 * =====================================================
 * LIVING PORTRAIT V2
 * =====================================================
 * Avatar photo-realiste. Joue une sequence de demarrage
 * complete une fois (24s), puis bascule sur un portrait
 * fixe dont le halo reagit a systemState.ai reel --
 * contrairement a V1 (LivingPortrait.jsx), dont l'etat
 * visuel n'etait jamais mis a jour apres le montage.
 *
 * Portee depuis une piece d'animation fournie separement
 * (portrait-scene.jsx). Le runtime de composition original
 * (support.js + animations-v3.jsx, ~3200 lignes, avec
 * editeur live et moteur aquarelle) n'est pas repris ;
 * seule l'interface minimale necessaire (Easing,
 * useComposition, CompositionStage) est reimplementee.
 * La logique de la piece elle-meme (Piece) est conservee
 * quasi verbatim.
 */

/* =====================================================
   EASING
   ===================================================== */
const Easing = {
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

const SCENES_DUR = [3, 4.5, 5.5, 5, 4, 2];
const TOTAL_DURATION = SCENES_DUR.reduce((s, x) => s + x, 0);

const CompositionContext = React.createContext(0);
function useComposition() {
  return React.useContext(CompositionContext);
}

function CompositionStage({ width, height, bg, children }) {
  const [T, setT] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    function tick(now) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = ((now - startRef.current) / 1000) % TOTAL_DURATION;
      setT(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      setScale(containerRef.current.offsetWidth / width);
    }
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: `${width} / ${height}`,
        background: bg,
        overflow: "hidden",
        borderRadius: 18,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <CompositionContext.Provider value={T}>
          {children}
        </CompositionContext.Provider>
      </div>
    </div>
  );
}

/* =====================================================
   PIECE -- portee quasi verbatim depuis portrait-scene.jsx
   ===================================================== */
const IMG = portraitImg;
const BASE = { left: 385, top: -30, size: 1150 };
const INK = "#f2efe9";
const CYAN = "#5ab6d8";
const AMBER = "#e2a45f";
const BG = "#08090b";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const DISP = "'Archivo', Helvetica, Arial, sans-serif";

const c01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const kf = (T, keys, ease) => {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (T <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + (v1 - v0) * ease(c01((T - t0) / Math.max(1e-6, t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
};

const MOTION = {
  enter: (T, start, dur) => Easing.easeOutCubic(c01((T - start) / (dur || 0.7))),
  glide: (T, keys) => kf(T, keys, Easing.easeInOutCubic),
  pop: (T, start, dur) => Easing.easeOutBack(c01((T - start) / (dur || 0.5))),
};
const band = (T, inAt, inDur, outAt, outDur) =>
  MOTION.enter(T, inAt, inDur) * (1 - MOTION.enter(T, outAt, outDur || 0.6));

const CAM = {
  k: [[0, 3.4], [3, 3.0], [7.5, 1.72], [13, 1.5], [18, 1.06], [22, 1.02], [24, 1.0]],
  fx: [[0, 960], [3, 952], [7.5, 959], [13, 962], [18, 1180], [22, 1205], [24, 1215]],
  fy: [[0, 373], [3, 380], [7.5, 640], [13, 610], [18, 520], [22, 512], [24, 508]],
};

const P = BASE.size / 1242;
const patch = (o) => ({
  position: "absolute",
  left: BASE.left + o.x * P,
  top: BASE.top + o.y * P,
  width: o.w * P,
  height: o.h * P,
  backgroundImage: `url("${IMG}")`,
  backgroundSize: `${BASE.size}px ${BASE.size}px`,
  backgroundPosition: `${-(o.sx !== undefined ? o.sx : o.x) * P}px ${-(o.sy !== undefined ? o.sy : o.y) * P}px`,
});

const BLINKS = [4.9, 7.9, 10.7, 14.3, 16.9, 19.9, 21.9];
const SPEAK = [[14.1, 17.3], [19.2, 21.5]];
const lidAt = (T) => {
  let v = 0;
  for (const b of BLINKS) {
    const d = T - b;
    if (d >= 0 && d < 0.3) {
      v = Math.max(
        v,
        d < 0.1 ? Easing.easeOutQuad(c01(d / 0.1)) : 1 - Easing.easeInOutQuad(c01((d - 0.1) / 0.18))
      );
    }
  }
  return v;
};
const speakAt = (T) => {
  let g = 0;
  for (const [a, b] of SPEAK) g = Math.max(g, MOTION.enter(T, a, 0.3) * (1 - MOTION.enter(T, b, 0.35)));
  if (g <= 0) return 0;
  const w = 0.56 * Math.sin(T * 10.4) + 0.44 * Math.sin(T * 6.7 + 1.1);
  return g * c01(Math.max(0, w) * 1.15);
};

const HUD = [
  { bx: 848, by: 373, dir: 1, lx: 1320, ly: 138, label: "OPTIC ARRAY", value: () => "TRACKING · 240 Hz", c: CYAN },
  { bx: 959, by: 776, dir: 1, lx: 1352, ly: 690, label: "CERVICAL BUS", value: (T) => (41.2 + Math.sin(T * 3.1) * 0.7).toFixed(1) + " Gb/s", c: CYAN },
  { bx: 663, by: 905, dir: -1, lx: 268, ly: 928, label: "DERMAL SYNTH", value: (T) => (36.4 + Math.sin(T * 1.6) * 0.06).toFixed(2) + " °C", c: AMBER },
];

function Rule({ x, y, w, o, c }) {
  return React.createElement("div", {
    style: { position: "absolute", left: x, top: y, width: Math.max(0, w), height: 1, background: c, opacity: o },
  });
}

function Piece(props) {
  const T = useComposition();
  const hudOn = props.hud !== false;

  const k = MOTION.glide(T, CAM.k);
  const fx = MOTION.glide(T, CAM.fx);
  const fy = MOTION.glide(T, CAM.fy);
  const sx = (bx) => 960 + (bx - fx) * k;
  const sy = (by) => 540 + (by - fy) * k;

  const imgOpacity = MOTION.enter(T, 2.15, 2.4);
  const bootOn = band(T, 0.35, 0.9, 2.4, 0.8);
  const bootBar = c01((T - 0.7) / 2.0);
  const pin = Math.max(
    kf(T, [[0, 0], [0.55, 0.6], [2.0, 0.5], [3.1, 0]], Easing.easeOutCubic),
    kf(T, [[22.0, 0], [22.9, 0.5], [23.4, 0.45], [24, 0]], Easing.easeInOutCubic)
  );
  const sweep1 = band(T, 3.15, 0.35, 5.0, 0.5);
  const sweepY1 = -260 + c01((T - 3.15) / 2.3) * 1500;
  const sweep2 = band(T, 5.5, 0.25, 6.6, 0.4);
  const sweepY2 = -260 + c01((T - 5.5) / 1.4) * 1500;
  const sigOn = band(T, 18.35, 0.9, 22.5, 1.0);
  const fade = kf(T, [[21.9, 0], [23.25, 1], [24, 1]], Easing.easeInOutCubic);
  const breathe = 0.5 + 0.5 * Math.sin((T - 13) * 1.35);
  const lid = lidAt(T);
  const talk = speakAt(T);
  const sway = `translate(${4.2 * Math.sin(T * 0.33)}px, ${3 * Math.sin(T * 0.27 + 1)}px) rotate(${0.34 * Math.sin(T * 0.45)}deg) scale(${1 + 0.0038 * Math.sin(T * 1.45)})`;
  const chestGlow = band(T, 12.9, 1.4, 21.6, 1.2) * (0.28 + 0.34 * breathe);

  const layer = (style, children) => React.createElement("div", { style: Object.assign({ position: "absolute" }, style) }, children);

  return React.createElement(
    "div",
    { style: { position: "absolute", inset: 0, background: BG, overflow: "hidden" } },

    layer(
      { inset: 0, transform: `translate(${960 - fx * k}px, ${540 - fy * k}px) scale(${k})`, transformOrigin: "0 0", opacity: imgOpacity },
      layer({ inset: 0, transform: sway, transformOrigin: "960px 840px" }, [
        React.createElement("div", {
          key: "img",
          style: {
            position: "absolute", left: BASE.left, top: BASE.top, width: BASE.size, height: BASE.size,
            backgroundImage: `url("${IMG}")`, backgroundSize: "cover", backgroundPosition: "center",
            filter: `contrast(${1.02 + 0.06 * (1 - imgOpacity)}) saturate(${0.86 + 0.14 * imgOpacity})`,
          },
        }),
        React.createElement("div", {
          key: "jaw",
          style: Object.assign(patch({ x: 448, y: 582, w: 352, h: 236 }), {
            transform: `translateY(${2.4 * talk * P}px) scaleY(${1 + 0.052 * talk})`,
            transformOrigin: "50% 0%",
            maskImage: "radial-gradient(ellipse 52% 58% at 50% 42%, #000 52%, rgba(0,0,0,0) 84%)",
            WebkitMaskImage: "radial-gradient(ellipse 52% 58% at 50% 42%, #000 52%, rgba(0,0,0,0) 84%)",
          }),
        }),
        React.createElement("div", {
          key: "mouth",
          style: {
            position: "absolute",
            left: BASE.left + 528 * P, top: BASE.top + (664 - 3 * talk) * P,
            width: 184 * P, height: (5 + 15 * talk) * P,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 50% 40%, rgba(48,20,18,0.82) 0%, rgba(48,20,18,0.32) 68%, rgba(48,20,18,0) 100%)",
            opacity: 0.2 + 0.7 * talk, filter: "blur(2.5px)",
          },
        }),
        React.createElement("div", {
          key: "lid",
          style: Object.assign(patch({ x: 414, y: 392, w: 404, h: 78, sy: 318 }), {
            height: 78 * P * lid,
            opacity: lid > 0 ? 1 : 0,
            boxShadow: lid > 0.5 ? "0 2px 4px rgba(60,32,24,0.45)" : "none",
            maskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 12%, #000 88%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 12%, #000 88%, rgba(0,0,0,0) 100%)",
          }),
        }),
      ])
    ),

    layer({
      left: sx(959) - 150 * k, top: sy(993) - 150 * k, width: 300 * k, height: 300 * k,
      background: `radial-gradient(circle, rgba(90,182,216,${0.5 * chestGlow}) 0%, rgba(90,182,216,0) 62%)`,
      pointerEvents: "none",
    }),

    layer({ left: 128, top: 128, opacity: bootOn }, [
      React.createElement("div", { key: "l", style: { fontFamily: MONO, fontSize: 15, letterSpacing: "0.32em", color: CYAN } }, "COLD START"),
      React.createElement("div", { key: "b", style: { marginTop: 14, width: 260, height: 2, background: "rgba(242,239,233,0.16)" } },
        React.createElement("div", { style: { width: `${bootBar * 100}%`, height: "100%", background: CYAN } })),
      React.createElement("div", { key: "v", style: { marginTop: 12, fontFamily: MONO, fontSize: 13, letterSpacing: "0.16em", color: "rgba(242,239,233,0.42)" } },
        "CORTICAL BOOT " + Math.round(bootBar * 100) + "%"),
    ]),

    layer({
      left: 0, top: sweepY1, width: "100%", height: 190, opacity: sweep1 * 0.9,
      background: `linear-gradient(180deg, rgba(90,182,216,0) 0%, rgba(90,182,216,0.10) 72%, rgba(90,182,216,0.55) 99%, rgba(255,255,255,0.9) 100%)`,
      mixBlendMode: "screen", pointerEvents: "none",
    }),
    layer({
      left: 0, top: sweepY2, width: "100%", height: 120, opacity: sweep2 * 0.5,
      background: `linear-gradient(180deg, rgba(226,164,95,0) 0%, rgba(226,164,95,0.28) 100%)`,
      mixBlendMode: "screen", pointerEvents: "none",
    }),

    hudOn && HUD.map((h, i) => {
      const o = band(T, 8.0 + i * 0.55, 0.7, 12.5 + i * 0.18, 0.7);
      if (o <= 0.001) return null;
      const ax = sx(h.bx), ay = sy(h.by);
      const lineW = Math.abs(h.lx - ax);
      return React.createElement("div", { key: i, style: { position: "absolute", inset: 0, opacity: o, pointerEvents: "none" } },
        layer({ left: ax - 4, top: ay - 4, width: 8, height: 8, border: `1px solid ${h.c}`, transform: `rotate(45deg) scale(${MOTION.pop(T, 8.0 + i * 0.55, 0.6)})` }),
        React.createElement(Rule, { x: Math.min(ax, h.lx), y: ay, w: lineW * MOTION.enter(T, 8.05 + i * 0.55, 0.8), o: 0.55, c: h.c }),
        layer({ left: h.lx, top: Math.min(ay, h.ly), width: 1, height: Math.abs(h.ly - ay), background: h.c, opacity: 0.4 }),
        layer({
          left: h.dir === 1 ? h.lx + 14 : 0, top: h.ly - 30, width: h.dir === 1 ? 420 : h.lx - 14,
          textAlign: h.dir === 1 ? "left" : "right",
        }, [
          React.createElement("div", { key: "a", style: { fontFamily: MONO, fontSize: 14, letterSpacing: "0.3em", color: "rgba(242,239,233,0.5)" } }, h.label),
          React.createElement("div", { key: "b", style: { marginTop: 8, fontFamily: DISP, fontWeight: 600, fontSize: 30, letterSpacing: "-0.01em", color: INK, fontVariantNumeric: "tabular-nums" } }, h.value(T)),
        ])
      );
    }),

    layer({ left: 1148, top: 392, width: 660, opacity: sigOn, transform: `translateY(${(1 - MOTION.enter(T, 18.35, 1.1)) * 26}px)` }, [
      React.createElement("div", { key: "k", style: { fontFamily: MONO, fontSize: 14, letterSpacing: "0.34em", color: AMBER } }, "SUBJECT 07"),
      React.createElement("div", { key: "t", style: { marginTop: 20, fontFamily: DISP, fontWeight: 700, fontSize: 92, lineHeight: 0.94, letterSpacing: "-0.03em", color: INK } }, "Awake"),
      React.createElement("div", { key: "r", style: { marginTop: 30, width: `${MOTION.enter(T, 18.9, 1.4) * 100}%`, height: 1, background: "rgba(242,239,233,0.3)" } }),
      React.createElement("div", { key: "c", style: { marginTop: 22, fontFamily: MONO, fontSize: 17, lineHeight: 1.7, letterSpacing: "0.06em", color: "rgba(242,239,233,0.55)" } },
        "Humanoid platform · Rev. C\nAll systems nominal".split("\n").map((s, i) => React.createElement("div", { key: i }, s))),
    ]),

    layer({ inset: 0, background: BG, opacity: fade, pointerEvents: "none" }),

    layer({
      left: 860, top: 440, width: 200, height: 200,
      background: `radial-gradient(circle, rgba(160,222,244,${0.9 * pin}) 0%, rgba(90,182,216,${0.35 * pin}) 26%, rgba(90,182,216,0) 66%)`,
      pointerEvents: "none",
    }),

    layer({
      inset: 0, pointerEvents: "none", opacity: 0.07,
      backgroundImage: "repeating-linear-gradient(180deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)",
    }),
    layer({
      inset: 0, pointerEvents: "none",
      background: "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.62) 100%)",
    })
  );
}

/* =====================================================
   PORTRAIT EN REGIME STABLE
   =====================================================
   Apres l'intro : photo fixe, halo colore selon
   systemState.ai reel (contrairement a V1, dont l'etat
   n'etait jamais mis a jour).
   ===================================================== */
const STATE_COLORS = {
  online: "#4a6b8a",
  listening: "#5ab6d8",
  thinking: "#e2a45f",
  speaking: "#5ab6d8",
};

function SteadyPortrait({ aiState }) {
  const color = STATE_COLORS[aiState] || STATE_COLORS.online;
  const isActive = aiState === "listening" || aiState === "speaking" || aiState === "thinking";

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(circle at center, #172b43 0%, #0b1220 65%)",

        "@keyframes livingPortraitV2Pulse": {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.1)" },
        },
      }}
    >
      <Box
        sx={{
          width: 240,
          height: 240,
          borderRadius: "50%",
          backgroundImage: `url(${portraitImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: `0 0 0 3px ${color}, 0 0 ${isActive ? 46 : 20}px ${isActive ? 14 : 6}px ${color}55`,
          transition: "box-shadow 0.5s ease",
          animation: isActive ? "livingPortraitV2Pulse 2.4s ease-in-out infinite" : "none",
        }}
      />
    </Box>
  );
}

/* =====================================================
   EXPORT
   ===================================================== */
export default function LivingPortraitV2() {
  const { systemState } = useLyssia();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), TOTAL_DURATION * 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  if (showIntro) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 980, px: 2 }}>
          <CompositionStage width={1920} height={1080} bg={BG}>
            <Piece hud={true} />
          </CompositionStage>
        </Box>
      </Box>
    );
  }

  return <SteadyPortrait aiState={systemState?.ai || "online"} />;
}
