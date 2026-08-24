import React, { useEffect, useRef, useState } from "react";

const IMG = "/lyssia-avatar.png";

const BASE = {
  left: 385,
  top: -30,
  size: 1150,
};

const INK = "#f2efe9";
const CYAN = "#5ab6d8";
const AMBER = "#e2a45f";
const BG = "#08090b";

const clamp = (v) =>
  Math.max(0, Math.min(1, v));

const easeInOutCubic = (t) => {
  t = clamp(t);
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const easeOutCubic = (t) => {
  t = clamp(t);
  return 1 - Math.pow(1 - t, 3);
};

const easeOutQuad = (t) => {
  t = clamp(t);
  return 1 - (1 - t) * (1 - t);
};

const easeInOutQuad = (t) => {
  t = clamp(t);
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

const easeOutBack = (t) => {
  t = clamp(t);

  const c1 = 1.70158;
  const c3 = c1 + 1;

  return (
    1 +
    c3 * Math.pow(t - 1, 3) +
    c1 * Math.pow(t - 1, 2)
  );
};

const keyframe = (T, keys, ease) => {
  if (T <= keys[0][0]) {
    return keys[0][1];
  }

  for (let i = 1; i < keys.length; i++) {
    if (T <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];

      const p = clamp(
        (T - t0) /
          Math.max(0.000001, t1 - t0)
      );

      return (
        v0 +
        (v1 - v0) * ease(p)
      );
    }
  }

  return keys[keys.length - 1][1];
};

const enter = (
  T,
  start,
  duration = 0.7
) =>
  easeOutCubic(
    (T - start) / duration
  );

const glide = (T, keys) =>
  keyframe(
    T,
    keys,
    easeInOutCubic
  );

const pop = (
  T,
  start,
  duration = 0.5
) =>
  easeOutBack(
    (T - start) / duration
  );

const band = (
  T,
  inAt,
  inDur,
  outAt,
  outDur
) =>
  enter(T, inAt, inDur) *
  (1 - enter(T, outAt, outDur || 0.6));

const CAM = {
  k: [
    [0, 3.4],
    [3, 3.0],
    [7.5, 1.72],
    [13, 1.5],
    [18, 1.06],
    [22, 1.02],
    [24, 1.0],
  ],

  fx: [
    [0, 960],
    [3, 952],
    [7.5, 959],
    [13, 962],
    [18, 1180],
    [22, 1205],
    [24, 1215],
  ],

  fy: [
    [0, 373],
    [3, 380],
    [7.5, 640],
    [13, 610],
    [18, 520],
    [22, 512],
    [24, 508],
  ],
};

const P =
  BASE.size / 1242;

const BLINKS = [
  4.9,
  7.9,
  10.7,
  14.3,
  16.9,
  19.9,
  21.9,
];

const SPEAK = [
  [14.1, 17.3],
  [19.2, 21.5],
];

const lidAt = (T) => {
  let value = 0;

  for (const blink of BLINKS) {
    const d = T - blink;

    if (d >= 0 && d < 0.3) {
      value = Math.max(
        value,
        d < 0.1
          ? easeOutQuad(d / 0.1)
          : 1 -
            easeInOutQuad(
              (d - 0.1) / 0.18
            )
      );
    }
  }

  return value;
};

const speakAt = (T) => {
  let gate = 0;

  for (const [a, b] of SPEAK) {
    gate = Math.max(
      gate,
      enter(T, a, 0.3) *
        (1 - enter(T, b, 0.35))
    );
  }

  if (gate <= 0) {
    return 0;
  }

  const wave =
    0.56 * Math.sin(T * 10.4) +
    0.44 * Math.sin(T * 6.7 + 1.1);

  return (
    gate *
    clamp(Math.max(0, wave) * 1.15)
  );
};

const HUD = [
  {
    bx: 848,
    by: 373,
    dir: 1,
    lx: 1320,
    ly: 138,
    label: "OPTIC ARRAY",
    value: () => "TRACKING · 240 Hz",
    color: CYAN,
  },

  {
    bx: 959,
    by: 776,
    dir: 1,
    lx: 1352,
    ly: 690,
    label: "CERVICAL BUS",
    value: (T) =>
      (
        41.2 +
        Math.sin(T * 3.1) * 0.7
      ).toFixed(1) + " Gb/s",
    color: CYAN,
  },

  {
    bx: 663,
    by: 905,
    dir: -1,
    lx: 268,
    ly: 928,
    label: "DERMAL SYNTH",
    value: (T) =>
      (
        36.4 +
        Math.sin(T * 1.6) * 0.06
      ).toFixed(2) + " °C",
    color: AMBER,
  },
];

const patchStyle = ({
  x,
  y,
  w,
  h,
  sx = x,
  sy = y,
}) => ({
  position: "absolute",
  left: BASE.left + x * P,
  top: BASE.top + y * P,
  width: w * P,
  height: h * P,
  backgroundImage:
    `url("${IMG}")`,
  backgroundSize:
    `${BASE.size}px ${BASE.size}px`,
  backgroundPosition:
    `${-sx * P}px ${-sy * P}px`,
});

export default function ColdStartPortrait() {
  const [time, setTime] =
    useState(0);

  const startRef =
    useRef(null);

  useEffect(() => {
    let frame;
    let cancelled = false;

    const loop = (now) => {
      if (cancelled) {
        return;
      }

      if (startRef.current === null) {
        startRef.current = now;
      }

      const elapsed =
        (now - startRef.current) /
        1000;

      setTime(elapsed % 24);

      frame =
        requestAnimationFrame(loop);
    };

    frame =
      requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  const T = time;

  const k =
    glide(T, CAM.k);

  const fx =
    glide(T, CAM.fx);

  const fy =
    glide(T, CAM.fy);

  const screenX = (x) =>
    960 + (x - fx) * k;

  const screenY = (y) =>
    540 + (y - fy) * k;

  const imgOpacity =
    enter(T, 2.15, 2.4);

  const bootOn =
    band(T, 0.35, 0.9, 2.4, 0.8);

  const bootBar =
    clamp((T - 0.7) / 2);

  const pin = Math.max(
    keyframe(
      T,
      [
        [0, 0],
        [0.55, 0.6],
        [2.0, 0.5],
        [3.1, 0],
      ],
      easeOutCubic
    ),
    keyframe(
      T,
      [
        [22, 0],
        [22.9, 0.5],
        [23.4, 0.45],
        [24, 0],
      ],
      easeInOutCubic
    )
  );

  const sweep1 =
    band(
      T,
      3.15,
      0.35,
      5.0,
      0.5
    );

  const sweepY1 =
    -260 +
    clamp(
      (T - 3.15) / 2.3
    ) *
      1500;

  const sweep2 =
    band(
      T,
      5.5,
      0.25,
      6.6,
      0.4
    );

  const sweepY2 =
    -260 +
    clamp(
      (T - 5.5) / 1.4
    ) *
      1500;

  const signature =
    band(
      T,
      18.35,
      0.9,
      22.5,
      1
    );

  const fade =
    keyframe(
      T,
      [
        [21.9, 0],
        [23.25, 1],
        [24, 1],
      ],
      easeInOutCubic
    );

  const breathe =
    0.5 +
    0.5 *
      Math.sin(
        (T - 13) * 1.35
      );

  const lid =
    lidAt(T);

  const talk =
    speakAt(T);

  const sway =
    `translate(
      ${4.2 * Math.sin(T * 0.33)}px,
      ${3 * Math.sin(T * 0.27 + 1)}px
    )
    rotate(
      ${0.34 * Math.sin(T * 0.45)}deg
    )
    scale(
      ${1 + 0.0038 * Math.sin(T * 1.45)}
    )`;

  const chestGlow =
    band(
      T,
      12.9,
      1.4,
      21.6,
      1.2
    ) *
    (0.28 + 0.34 * breathe);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: BG,
        color: INK,
      }}
    >
      {/* PORTRAIT + CAMERA */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform:
            `translate(
              ${960 - fx * k}px,
              ${540 - fy * k}px
            ) scale(${k})`,
          transformOrigin:
            "0 0",
          opacity: imgOpacity,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: sway,
            transformOrigin:
              "960px 840px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: BASE.left,
              top: BASE.top,
              width: BASE.size,
              height: BASE.size,
              backgroundImage:
                `url("${IMG}")`,
              backgroundSize:
                "cover",
              backgroundPosition:
                "center",
              filter:
                `contrast(${1.02 + 0.06 * (1 - imgOpacity)})
                 saturate(${0.86 + 0.14 * imgOpacity})`,
            }}
          />

          {/* MACHOIRE */}

          <div
            style={{
              ...patchStyle({
                x: 448,
                y: 582,
                w: 352,
                h: 236,
              }),
              transform:
                `translateY(
                  ${2.4 * talk * P}px
                )
                scaleY(
                  ${1 + 0.052 * talk}
                )`,
              transformOrigin:
                "50% 0%",
              maskImage:
                "radial-gradient(ellipse 52% 58% at 50% 42%, #000 52%, transparent 84%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 52% 58% at 50% 42%, #000 52%, transparent 84%)",
            }}
          />

          {/* BOUCHE */}

          <div
            style={{
              position: "absolute",
              left:
                BASE.left +
                528 * P,
              top:
                BASE.top +
                (664 - 3 * talk) * P,
              width: 184 * P,
              height:
                (5 + 15 * talk) * P,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(48,20,18,0.82), rgba(48,20,18,0.32) 68%, transparent)",
              opacity:
                0.2 + 0.7 * talk,
              filter: "blur(2.5px)",
            }}
          />

          {/* PAUPIERES */}

          <div
            style={{
              ...patchStyle({
                x: 414,
                y: 392,
                w: 404,
                h: 78,
                sy: 318,
              }),
              height:
                78 * P * lid,
              opacity:
                lid > 0 ? 1 : 0,
              boxShadow:
                lid > 0.5
                  ? "0 2px 4px rgba(60,32,24,0.45)"
                  : "none",
              maskImage:
                "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
            }}
          />
        </div>
      </div>

      {/* LUMIERE POITRINE */}

      <div
        style={{
          position: "absolute",
          left:
            screenX(959) -
            150 * k,
          top:
            screenY(993) -
            150 * k,
          width: 300 * k,
          height: 300 * k,
          background:
            `radial-gradient(
              circle,
              rgba(90,182,216,${0.5 * chestGlow}) 0%,
              rgba(90,182,216,0) 62%
            )`,
          pointerEvents: "none",
        }}
      />

      {/* BOOT */}

      <div
        style={{
          position: "absolute",
          left: 128,
          top: 128,
          opacity: bootOn,
          fontFamily:
            "'IBM Plex Mono', monospace",
        }}
      >
        <div
          style={{
            fontSize: 15,
            letterSpacing: "0.32em",
            color: CYAN,
          }}
        >
          COLD START
        </div>

        <div
          style={{
            marginTop: 14,
            width: 260,
            height: 2,
            background:
              "rgba(242,239,233,0.16)",
          }}
        >
          <div
            style={{
              width:
                `${bootBar * 100}%`,
              height: "100%",
              background: CYAN,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 13,
            letterSpacing: "0.16em",
            color:
              "rgba(242,239,233,0.42)",
          }}
        >
          CORTICAL BOOT{" "}
          {Math.round(
            bootBar * 100
          )}
          %
        </div>
      </div>

      {/* SCAN 1 */}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: sweepY1,
          width: "100%",
          height: 190,
          opacity:
            sweep1 * 0.9,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(90,182,216,0.10) 72%, rgba(90,182,216,0.55) 99%, rgba(255,255,255,0.9) 100%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* SCAN 2 */}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: sweepY2,
          width: "100%",
          height: 120,
          opacity:
            sweep2 * 0.5,
          background:
            "linear-gradient(180deg, transparent, rgba(226,164,95,0.28))",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* HUD */}

      {HUD.map((item, index) => {
        const opacity =
          band(
            T,
            8 +
              index * 0.55,
            0.7,
            12.5 +
              index * 0.18,
            0.7
          );

        if (opacity <= 0.001) {
          return null;
        }

        const ax =
          screenX(item.bx);

        const ay =
          screenY(item.by);

        const lineWidth =
          Math.abs(
            item.lx - ax
          );

        return (
          <div
            key={item.label}
            style={{
              position: "absolute",
              inset: 0,
              opacity,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: ax - 4,
                top: ay - 4,
                width: 8,
                height: 8,
                border:
                  `1px solid ${item.color}`,
                transform:
                  `rotate(45deg) scale(
                    ${pop(
                      T,
                      8 +
                        index * 0.55,
                      0.6
                    )}
                  )`,
              }}
            />

            <div
              style={{
                position: "absolute",
                left:
                  Math.min(
                    ax,
                    item.lx
                  ),
                top: ay,
                width:
                  lineWidth *
                  enter(
                    T,
                    8.05 +
                      index * 0.55,
                    0.8
                  ),
                height: 1,
                background:
                  item.color,
                opacity: 0.55,
              }}
            />

            <div
              style={{
                position: "absolute",
                left: item.lx,
                top:
                  Math.min(
                    ay,
                    item.ly
                  ),
                width: 1,
                height:
                  Math.abs(
                    item.ly - ay
                  ),
                background:
                  item.color,
                opacity: 0.4,
              }}
            />

            <div
              style={{
                position: "absolute",
                left:
                  item.dir === 1
                    ? item.lx + 14
                    : 0,
                top:
                  item.ly - 30,
                width:
                  item.dir === 1
                    ? 420
                    : item.lx - 14,
                textAlign:
                  item.dir === 1
                    ? "left"
                    : "right",
              }}
            >
              <div
                style={{
                  fontFamily:
                    "'IBM Plex Mono', monospace",
                  fontSize: 14,
                  letterSpacing:
                    "0.3em",
                  color:
                    "rgba(242,239,233,0.5)",
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontFamily:
                    "'Archivo', Helvetica, Arial, sans-serif",
                  fontWeight: 600,
                  fontSize: 30,
                  color: INK,
                }}
              >
                {item.value(T)}
              </div>
            </div>
          </div>
        );
      })}

      {/* SIGNATURE */}

      <div
        style={{
          position: "absolute",
          left: 1148,
          top: 392,
          width: 660,
          opacity: signature,
          transform:
            `translateY(
              ${(1 -
                enter(
                  T,
                  18.35,
                  1.1
                )) *
                26}px
            )`,
        }}
      >
        <div
          style={{
            fontFamily:
              "'IBM Plex Mono', monospace",
            fontSize: 14,
            letterSpacing:
              "0.34em",
            color: AMBER,
          }}
        >
          SUBJECT 07
        </div>

        <div
          style={{
            marginTop: 20,
            fontFamily:
              "'Archivo', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 0.94,
            color: INK,
          }}
        >
          Awake
        </div>

        <div
          style={{
            marginTop: 30,
            width:
              `${enter(
                T,
                18.9,
                1.4
              ) * 100}%`,
            height: 1,
            background:
              "rgba(242,239,233,0.3)",
          }}
        />

        <div
          style={{
            marginTop: 22,
            fontFamily:
              "'IBM Plex Mono', monospace",
            fontSize: 17,
            lineHeight: 1.7,
            color:
              "rgba(242,239,233,0.55)",
          }}
        >
          Humanoid platform · Rev. C
          <br />
          All systems nominal
        </div>
      </div>

      {/* FADE */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: BG,
          opacity: fade,
          pointerEvents: "none",
        }}
      />

      {/* PIN LIGHT */}

      <div
        style={{
          position: "absolute",
          left: 860,
          top: 440,
          width: 200,
          height: 200,
          background:
            `radial-gradient(
              circle,
              rgba(160,222,244,${0.9 * pin}) 0%,
              rgba(90,182,216,${0.35 * pin}) 26%,
              rgba(90,182,216,0) 66%
            )`,
          pointerEvents: "none",
        }}
      />

      {/* GRAIN */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* VIGNETTE */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 42%, rgba(0,0,0,0.62) 100%)",
        }}
      />
    </div>
  );
}
