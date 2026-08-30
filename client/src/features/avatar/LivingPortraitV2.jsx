import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import { Box } from "@mui/material";

import { useLyssia } from "../../core/LyssiaCore";

import portraitImg from "../../assets/lyssia-portrait.png";

import {
  avatarEngine,
  lipSyncController,
  animationController,
  startAvatarSystem,
} from "../../components/AvatarSystem.js";

import {
  LyssiaAvatar,
} from "../../components/LyssiaAvatar.jsx";


/**
 * =====================================================
 * LIVING PORTRAIT V2
 * =====================================================
 *
 * Avatar principal de Lyssia.
 *
 * Architecture :
 *
 *                    LYSSIA OS
 *                        │
 *                        ▼
 *                 AvatarSystem
 *                        │
 *          ┌─────────────┼─────────────┐
 *          │             │             │
 *          ▼             ▼             ▼
 *      AvatarEngine   LipSync      Animation
 *          │             │             │
 *          └─────────────┼─────────────┘
 *                        │
 *                        ▼
 *                 LyssiaAvatar
 *
 * LivingPortraitV2 ne crée donc plus ses propres
 * instances des contrôleurs.
 */


/* =====================================================
   EASING
   ===================================================== */

const Easing = {

  easeOutQuad: (t) =>
    t * (2 - t),

  easeInOutQuad: (t) =>
    t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t,

  easeOutCubic: (t) => {

    const value =
      t - 1;

    return (
      value *
      value *
      value +
      1
    );

  },

  easeInOutCubic: (t) =>
    t < 0.5

      ? 4 * t * t * t

      : (t - 1) *
        (2 * t - 2) *
        (2 * t - 2) +
        1,

  easeOutBack: (t) => {

    const c1 =
      1.70158;

    const c3 =
      c1 + 1;

    return (
      1 +
      c3 *
      Math.pow(
        t - 1,
        3
      ) +
      c1 *
      Math.pow(
        t - 1,
        2
      )
    );

  },

};


/* =====================================================
   DURÉES DES SCÈNES
   ===================================================== */

const SCENES_DUR = [

  3,
  4.5,
  5.5,
  5,
  4,
  2,

];


const TOTAL_DURATION =
  SCENES_DUR.reduce(
    (
      sum,
      duration
    ) =>
      sum +
      duration,
    0
  );


/* =====================================================
   COMPOSITION CONTEXT
   ===================================================== */

const CompositionContext =
  React.createContext(0);


function useComposition() {

  return React.useContext(
    CompositionContext
  );

}


/* =====================================================
   COMPOSITION STAGE
   ===================================================== */

function CompositionStage({
  width,
  height,
  bg,
  children,
}) {

  const [
    T,
    setT
  ] =
    useState(0);


  const startRef =
    useRef(null);


  const rafRef =
    useRef(null);


  const containerRef =
    useRef(null);


  const [
    scale,
    setScale
  ] =
    useState(0.3);


  /* -------------------------------------------------
     TIME LOOP
     ------------------------------------------------- */

  useEffect(() => {

    function tick(now) {

      if (
        startRef.current === null
      ) {

        startRef.current =
          now;

      }


      const elapsed =

        (
          now -
          startRef.current
        ) /
        1000;


      const localTime =
        elapsed %
        TOTAL_DURATION;


      setT(
        localTime
      );


      rafRef.current =
        requestAnimationFrame(
          tick
        );

    }


    rafRef.current =
      requestAnimationFrame(
        tick
      );


    return () => {

      if (
        rafRef.current
      ) {

        cancelAnimationFrame(
          rafRef.current
        );

      }

    };

  }, []);


  /* -------------------------------------------------
     RESPONSIVE SCALE
     ------------------------------------------------- */

  useEffect(() => {

    function updateScale() {

      if (
        !containerRef.current
      ) {

        return;

      }


      const currentWidth =
        containerRef.current
          .offsetWidth;


      setScale(
        currentWidth /
        width
      );

    }


    updateScale();


    const resizeObserver =
      new ResizeObserver(
        updateScale
      );


    if (
      containerRef.current
    ) {

      resizeObserver.observe(
        containerRef.current
      );

    }


    window.addEventListener(
      "resize",
      updateScale
    );


    return () => {

      resizeObserver.disconnect();

      window.removeEventListener(
        "resize",
        updateScale
      );

    };

  }, [
    width
  ]);


  return (

    <div

      ref={
        containerRef
      }

      style={{

        width:
          "100%",

        position:
          "relative",

        aspectRatio:
          `${width}/${height}`,

        background:
          bg,

        overflow:
          "hidden",

        borderRadius:
          18,

      }}

    >

      <div

        style={{

          position:
            "absolute",

          top:
            0,

          left:
            0,

          width,

          height,

          transform:
            `scale(${scale})`,

          transformOrigin:
            "top left",

        }}

      >

        <CompositionContext.Provider
          value={T}
        >

          {children}

        </CompositionContext.Provider>

      </div>

    </div>

  );

}


/* =====================================================
   IMAGE / COLORS
   ===================================================== */

const IMG =
  portraitImg;


const BASE = {

  left:
    385,

  top:
    -30,

  size:
    1150,

};


const INK =
  "#f2efe9";


const CYAN =
  "#5ab6d8";


const AMBER =
  "#e2a45f";


const BG =
  "#08090b";


const MONO =
  "'IBM Plex Mono', ui-monospace, monospace";


const DISP =
  "'Archivo', Helvetica, Arial, sans-serif";


const P =
  BASE.size /
  1242;


/* =====================================================
   UTILITIES
   ===================================================== */

function clamp01(value) {

  return Math.min(
    1,
    Math.max(
      0,
      value
    )
  );

}


function keyframe(
  T,
  keys,
  easing
) {

  if (
    T <= keys[0][0]
  ) {

    return keys[0][1];

  }


  for (
    let index = 1;
    index < keys.length;
    index += 1
  ) {

    if (
      T <= keys[index][0]
    ) {

      const [
        t0,
        v0
      ] =
        keys[index - 1];


      const [
        t1,
        v1
      ] =
        keys[index];


      const progress =
        clamp01(
          (
            T -
            t0
          ) /
          Math.max(
            0.000001,
            t1 -
            t0
          )
        );


      return (

        v0 +

        (
          v1 -
          v0
        ) *

        easing(
          progress
        )

      );

    }

  }


  return (
    keys[
      keys.length - 1
    ][1]
  );

}


/* =====================================================
   MOTION
   ===================================================== */

const Motion = {

  enter(
    T,
    start,
    duration = 0.7
  ) {

    return Easing.easeOutCubic(

      clamp01(
        (
          T -
          start
        ) /
        duration
      )

    );

  },


  glide(
    T,
    keys
  ) {

    return keyframe(
      T,
      keys,
      Easing.easeInOutCubic
    );

  },


  pop(
    T,
    start,
    duration = 0.5
  ) {

    return Easing.easeOutBack(

      clamp01(
        (
          T -
          start
        ) /
        duration
      )

    );

  },

};


/* =====================================================
   BAND
   ===================================================== */

function band(
  T,
  inAt,
  inDuration,
  outAt,
  outDuration = 0.6
) {

  return (

    Motion.enter(
      T,
      inAt,
      inDuration
    )

    *

    (
      1 -

      Motion.enter(
        T,
        outAt,
        outDuration
      )

    )

  );

}


/* =====================================================
   CAMERA
   ===================================================== */

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


/* =====================================================
   PATCH
   ===================================================== */

function createPatch({
  x,
  y,
  w,
  h,
  sx = x,
  sy = y,
}) {

  return {

    position:
      "absolute",

    left:
      BASE.left +
      x * P,

    top:
      BASE.top +
      y * P,

    width:
      w * P,

    height:
      h * P,

    backgroundImage:
      `url("${IMG}")`,

    backgroundSize:
      `${BASE.size}px ${BASE.size}px`,

    backgroundPosition:
      `${-sx * P}px ${-sy * P}px`,

  };

}


/* =====================================================
   BLINK
   ===================================================== */

const BLINKS = [

  4.9,
  7.9,
  10.7,
  14.3,
  16.9,
  19.9,
  21.9,

];


function blinkAt(T) {

  let value =
    0;


  for (
    const blinkTime
    of BLINKS
  ) {

    const delta =
      T -
      blinkTime;


    if (
      delta >= 0 &&
      delta < 0.3
    ) {

      let current;


      if (
        delta <
        0.1
      ) {

        current =
          Easing.easeOutQuad(
            clamp01(
              delta /
              0.1
            )
          );

      } else {

        current =

          1 -

          Easing.easeInOutQuad(

            clamp01(
              (
                delta -
                0.1
              ) /
              0.18
            )

          );

      }


      value =
        Math.max(
          value,
          current
        );

    }

  }


  return value;

}


/* =====================================================
   INTRO SPEECH
   ===================================================== */

const INTRO_SPEAK = [

  [
    14.1,
    17.3
  ],

  [
    19.2,
    21.5
  ],

];


function speakAt(T) {

  let value =
    0;


  for (
    const [
      start,
      end
    ]
    of INTRO_SPEAK
  ) {

    const active =

      Motion.enter(
        T,
        start,
        0.3
      )

      *

      (
        1 -

        Motion.enter(
          T,
          end,
          0.35
        )

      );


    value =
      Math.max(
        value,
        active
      );

  }


  if (
    value <= 0
  ) {

    return 0;

  }


  const wave =

    0.56 *
    Math.sin(
      T *
      10.4
    )

    +

    0.44 *
    Math.sin(
      T *
      6.7 +
      1.1
    );


  return (

    value *

    clamp01(
      Math.max(
        0,
        wave
      ) *
      1.15
    )

  );

}


/* =====================================================
   HUD
   ===================================================== */

const HUD = [

  {

    bx:
      848,

    by:
      373,

    dir:
      1,

    lx:
      1320,

    ly:
      138,

    label:
      "OPTIC ARRAY",

    value:
      () =>
        "TRACKING · 240 Hz",

    c:
      CYAN,

  },

  {

    bx:
      959,

    by:
      776,

    dir:
      1,

    lx:
      1352,

    ly:
      690,

    label:
      "CERVICAL BUS",

    value:
      (T) =>

        (

          41.2 +

          Math.sin(
            T *
            3.1
          ) *
          0.7

        ).toFixed(1) +

        " Gb/s",

    c:
      CYAN,

  },

  {

    bx:
      663,

    by:
      905,

    dir:
      -1,

    lx:
      268,

    ly:
      928,

    label:
      "DERMAL SYNTH",

    value:
      (T) =>

        (

          36.4 +

          Math.sin(
            T *
            1.6
          ) *
          0.06

        ).toFixed(2) +

        " °C",

    c:
      AMBER,

  },

];


/* =====================================================
   RULE
   ===================================================== */

function Rule({
  x,
  y,
  w,
  o,
  c,
}) {

  return (

    <div

      style={{

        position:
          "absolute",

        left:
          x,

        top:
          y,

        width:
          Math.max(
            0,
            w
          ),

        height:
          1,

        background:
          c,

        opacity:
          o,

      }}

    />

  );

}


/* =====================================================
   INTRO PIECE
   ===================================================== */

function Piece({
  hud = true,
}) {

  const T =
    useComposition();


  const k =
    Motion.glide(
      T,
      CAM.k
    );


  const fx =
    Motion.glide(
      T,
      CAM.fx
    );


  const fy =
    Motion.glide(
      T,
      CAM.fy
    );


  const sx =
    (baseX) =>

      960 +

      (
        baseX -
        fx
      ) *
      k;


  const sy =
    (baseY) =>

      540 +

      (
        baseY -
        fy
      ) *
      k;


  const imageOpacity =
    Motion.enter(
      T,
      2.15,
      2.4
    );


  const boot =
    band(
      T,
      0.35,
      0.9,
      2.4,
      0.8
    );


  const bootBar =
    clamp01(
      (
        T -
        0.7
      ) /
      2
    );


  const pin =
    Math.max(

      keyframe(

        T,

        [
          [0, 0],
          [0.55, 0.6],
          [2.0, 0.5],
          [3.1, 0],

        ],

        Easing.easeOutCubic

      ),

      keyframe(

        T,

        [
          [22, 0],
          [22.9, 0.5],
          [23.4, 0.45],
          [24, 0],

        ],

        Easing.easeInOutCubic

      )

    );


  const sweep1 =
    band(
      T,
      3.15,
      0.35,
      5,
      0.5
    );


  const sweepY1 =

    -260 +

    clamp01(
      (
        T -
        3.15
      ) /
      2.3
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

    clamp01(
      (
        T -
        5.5
      ) /
      1.4
    ) *
    1500;


  const signal =
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

      Easing.easeInOutCubic

    );


  const breathe =

    0.5 +

    0.5 *

    Math.sin(
      (
        T -
        13
      ) *
      1.35
    );


  const blink =
    blinkAt(
      T
    );


  const talk =
    speakAt(
      T
    );


  const sway =

    `translate(
      ${
        4.2 *
        Math.sin(
          T *
          0.33
        )
      }px,
      ${
        3 *
        Math.sin(
          T *
          0.27 +
          1
        )
      }px
    )
    rotate(
      ${
        0.34 *
        Math.sin(
          T *
          0.45
        )
      }deg
    )
    scale(
      ${
        1 +
        0.0038 *
        Math.sin(
          T *
          1.45
        )
      }
    )`;


  const chestGlow =

    band(
      T,
      12.9,
      1.4,
      21.6,
      1.2
    )

    *

    (
      0.28 +
      0.34 *
      breathe
    );


  const layer =
    (
      style,
      children = null
    ) => (

      <div

        style={{

          position:
            "absolute",

          ...style,

        }}

      >

        {children}

      </div>

    );


  return (

    <div

      style={{

        position:
          "absolute",

        inset:
          0,

        background:
          BG,

        overflow:
          "hidden",

      }}

    >

      {layer(

        {

          inset:
            0,

          transform:

            `translate(
              ${
                960 -
                fx *
                k
              }px,
              ${
                540 -
                fy *
                k
              }px
            )
            scale(${k})`,

          transformOrigin:
            "0 0",

          opacity:
            imageOpacity,

        },

        layer(

          {

            inset:
              0,

            transform:
              sway,

            transformOrigin:
              "960px 840px",

          },

          [

            <div

              key="image"

              style={{

                position:
                  "absolute",

                left:
                  BASE.left,

                top:
                  BASE.top,

                width:
                  BASE.size,

                height:
                  BASE.size,

                backgroundImage:
                  `url("${IMG}")`,

                backgroundSize:
                  "cover",

                backgroundPosition:
                  "center",

                filter:

                  `contrast(
                    ${
                      1.02 +
                      0.06 *
                      (
                        1 -
                        imageOpacity
                      )
                    }
                  )
                  saturate(
                    ${
                      0.86 +
                      0.14 *
                      imageOpacity
                    }
                  )`,

              }}

            />,


            <div

              key="jaw"

              style={{

                ...createPatch({

                  x:
                    448,

                  y:
                    582,

                  w:
                    352,

                  h:
                    236,

                }),

                transform:

                  `translateY(
                    ${
                      2.4 *
                      talk *
                      P
                    }px
                  )
                  scaleY(
                    ${
                      1 +
                      0.052 *
                      talk
                    }
                  )`,

                transformOrigin:
                  "50% 0%",

                maskImage:

                  "radial-gradient(ellipse 52% 58% at 50% 42%, #000 52%, rgba(0,0,0,0) 84%)",

                WebkitMaskImage:

                  "radial-gradient(ellipse 52% 58% at 50% 42%, #000 52%, rgba(0,0,0,0) 84%)",

              }}

            />,


            <div

              key="mouth"

              style={{

                position:
                  "absolute",

                left:
                  BASE.left +
                  528 *
                  P,

                top:
                  BASE.top +
                  (
                    664 -
                    3 *
                    talk
                  ) *
                  P,

                width:
                  184 *
                  P,

                height:
                  20 *
                  P,

                borderRadius:
                  "50%",

                background:

                  "radial-gradient(ellipse at 50% 40%, rgba(48,20,18,0.82) 0%, rgba(48,20,18,0.32) 68%, rgba(48,20,18,0) 100%)",

                opacity:
                  0.2 +
                  0.7 *
                  talk,

                filter:
                  "blur(2.5px)",

              }}

            />,


            <div

              key="lid"

              style={{

                ...createPatch({

                  x:
                    414,

                  y:
                    392,

                  w:
                    404,

                  h:
                    78,

                  sy:
                    318,

                }),

                height:
                  78 *
                  P *
                  blink,

                opacity:
                  blink > 0
                    ? 1
                    : 0,

                boxShadow:
                  blink > 0.5

                    ? "0 2px 4px rgba(60,32,24,0.45)"

                    : "none",

                maskImage:

                  "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 12%, #000 88%, rgba(0,0,0,0) 100%)",

                WebkitMaskImage:

                  "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 12%, #000 88%, rgba(0,0,0,0) 100%)",

              }}

            />,

          ]

        )

      )}


      {layer({

        left:
          sx(959) -
          150 *
          k,

        top:
          sy(993) -
          150 *
          k,

        width:
          300 *
          k,

        height:
          300 *
          k,

        background:

          `radial-gradient(
            circle,
            rgba(
              90,
              182,
              216,
              ${
                0.5 *
                chestGlow
              }
            ) 0%,
            rgba(
              90,
              182,
              216,
              0
            ) 62%
          )`,

        pointerEvents:
          "none",

      })}


      {layer(

        {

          left:
            128,

          top:
            128,

          opacity:
            boot,

        },

        [

          <div

            key="cold"

            style={{

              fontFamily:
                MONO,

              fontSize:
                15,

              letterSpacing:
                "0.32em",

              color:
                CYAN,

            }}

          >

            COLD START

          </div>,


          <div

            key="bar"

            style={{

              marginTop:
                14,

              width:
                260,

              height:
                2,

              background:
                "rgba(242,239,233,0.16)",

            }}

          >

            <div

              style={{

                width:
                  `${bootBar * 100}%`,

                height:
                  "100%",

                background:
                  CYAN,

              }}

            />

          </div>,


          <div

            key="value"

            style={{

              marginTop:
                12,

              fontFamily:
                MONO,

              fontSize:
                13,

              letterSpacing:
                "0.16em",

              color:
                "rgba(242,239,233,0.42)",

            }}

          >

            CORTICAL BOOT{" "}
            {Math.round(
              bootBar *
              100
            )}
            %

          </div>,

        ]

      )}


      {layer({

        left:
          0,

        top:
          sweepY1,

        width:
          "100%",

        height:
          190,

        opacity:
          sweep1 *
          0.9,

        background:

          "linear-gradient(180deg, rgba(90,182,216,0) 0%, rgba(90,182,216,0.10) 72%, rgba(90,182,216,0.55) 99%, rgba(255,255,255,0.9) 100%)",

        mixBlendMode:
          "screen",

        pointerEvents:
          "none",

      })}


      {layer({

        left:
          0,

        top:
          sweepY2,

        width:
          "100%",

        height:
          120,

        opacity:
          sweep2 *
          0.5,

        background:

          "linear-gradient(180deg, rgba(226,164,95,0) 0%, rgba(226,164,95,0.28) 100%)",

        mixBlendMode:
          "screen",

        pointerEvents:
          "none",

      })}


      {hud &&
        HUD.map(
          (
            item,
            index
          ) => {

            const opacity =
              band(
                T,
                8 +
                index *
                0.55,
                0.7,
                12.5 +
                index *
                0.18,
                0.7
              );


            if (
              opacity <=
              0.001
            ) {

              return null;

            }


            const anchorX =
              sx(
                item.bx
              );


            const anchorY =
              sy(
                item.by
              );


            const lineWidth =
              Math.abs(
                item.lx -
                anchorX
              );


            return (

              <div

                key={
                  index
                }

                style={{

                  position:
                    "absolute",

                  inset:
                    0,

                  opacity,

                  pointerEvents:
                    "none",

                }}

              >

                {layer({

                  left:
                    anchorX -
                    4,

                  top:
                    anchorY -
                    4,

                  width:
                    8,

                  height:
                    8,

                  border:
                    `1px solid ${item.c}`,

                  transform:

                    `rotate(45deg)
                    scale(
                      ${
                        Motion.pop(
                          T,
                          8 +
                          index *
                          0.55,
                          0.6
                        )
                      }
                    )`,

                })}


                <Rule

                  x={
                    Math.min(
                      anchorX,
                      item.lx
                    )
                  }

                  y={
                    anchorY
                  }

                  w={

                    lineWidth *

                    Motion.enter(
                      T,
                      8.05 +
                      index *
                      0.55,
                      0.8
                    )

                  }

                  o={
                    0.55
                  }

                  c={
                    item.c
                  }

                />


                {layer({

                  left:
                    item.lx,

                  top:

                    Math.min(
                      anchorY,
                      item.ly
                    ),

                  width:
                    1,

                  height:

                    Math.abs(
                      item.ly -
                      anchorY
                    ),

                  background:
                    item.c,

                  opacity:
                    0.4,

                })}


                {layer(

                  {

                    left:
                      item.dir === 1

                        ? item.lx +
                          14

                        : 0,

                    top:
                      item.ly -
                      30,

                    width:

                      item.dir === 1

                        ? 420

                        : item.lx -
                          14,

                    textAlign:

                      item.dir === 1

                        ? "left"

                        : "right",

                  },

                  [

                    <div

                      key="label"

                      style={{

                        fontFamily:
                          MONO,

                        fontSize:
                          14,

                        letterSpacing:
                          "0.3em",

                        color:
                          "rgba(242,239,233,0.5)",

                      }}

                    >

                      {item.label}

                    </div>,


                    <div

                      key="value"

                      style={{

                        marginTop:
                          8,

                        fontFamily:
                          DISP,

                        fontWeight:
                          600,

                        fontSize:
                          30,

                        letterSpacing:
                          "-0.01em",

                        color:
                          INK,

                        fontVariantNumeric:
                          "tabular-nums",

                      }}

                    >

                      {item.value(T)}

                    </div>,

                  ]

                )}

              </div>

            );

          }
        )}


      {layer(

        {

          left:
            1148,

          top:
            392,

          width:
            660,

          opacity:
            signal,

          transform:

            `translateY(
              ${
                (
                  1 -
                  Motion.enter(
                    T,
                    18.35,
                    1.1
                  )
                ) *
                26
              }px
            )`,

        },

        [

          <div

            key="subject"

            style={{

              fontFamily:
                MONO,

              fontSize:
                14,

              letterSpacing:
                "0.34em",

              color:
                AMBER,

            }}

          >

            SUBJECT 07

          </div>,


          <div

            key="title"

            style={{

              marginTop:
                20,

              fontFamily:
                DISP,

              fontWeight:
                700,

              fontSize:
                92,

              lineHeight:
                0.94,

              letterSpacing:
                "-0.03em",

              color:
                INK,

            }}

          >

            Awake

          </div>,


          <div

            key="rule"

            style={{

              marginTop:
                30,

              width:

                `${
                  Motion.enter(
                    T,
                    18.9,
                    1.4
                  ) *
                  100
                }%`,

              height:
                1,

              background:
                "rgba(242,239,233,0.3)",

            }}

          />,


          <div

            key="description"

            style={{

              marginTop:
                22,

              fontFamily:
                MONO,

              fontSize:
                17,

              lineHeight:
                1.7,

              letterSpacing:
                "0.06em",

              color:
                "rgba(242,239,233,0.55)",

            }}

          >

            <div>
              Humanoid platform · Rev. C
            </div>

            <div>
              All systems nominal
            </div>

          </div>,

        ]

      )}


      {layer({

        inset:
          0,

        background:
          BG,

        opacity:
          fade,

        pointerEvents:
          "none",

      })}


      {layer({

        left:
          860,

        top:
          440,

        width:
          200,

        height:
          200,

        background:

          `radial-gradient(
            circle,
            rgba(
              160,
              222,
              244,
              ${
                0.9 *
                pin
              }
            ) 0%,
            rgba(
              90,
              182,
              216,
              ${
                0.35 *
                pin
              }
            ) 26%,
            rgba(
              90,
              182,
              216,
              0
            ) 66%
          )`,

        pointerEvents:
          "none",

      })}


      {layer({

        inset:
          0,

        pointerEvents:
          "none",

        opacity:
          0.07,

        backgroundImage:

          "repeating-linear-gradient(180deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)",

      })}


      {layer({

        inset:
          0,

        pointerEvents:
          "none",

        background:

          "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.62) 100%)",

      })}

    </div>

  );

}


/* =====================================================
   LIVING PORTRAIT V2
   ===================================================== */

export default function LivingPortraitV2() {

  const {
    systemState
  } = useLyssia();


  /* =================================================
     SYSTÈME AVATAR CENTRAL
     ================================================= */

  useEffect(() => {

    startAvatarSystem();

  }, []);


  /* =================================================
     INTRO
     ================================================= */

  const [
    showIntro,
    setShowIntro
  ] =
    useState(true);


  useEffect(() => {

    const timer =
      setTimeout(
        () => {

          setShowIntro(
            false
          );

        },
        TOTAL_DURATION *
        1000
      );


    return () => {

      clearTimeout(
        timer
      );

    };

  }, []);


  /* =================================================
     SYNCHRONISATION AVEC LYSSIA CORE
     =================================================
     
     Le moteur central reste la source de vérité.
     Conversation.jsx effectue lui aussi les transitions
     via AvatarSystem.
     
     Ici nous reflétons l'état Core lorsqu'il est utilisé
     par un autre chemin de l'application.
     ================================================= */

  useEffect(() => {

    const aiState =
      systemState?.ai;


    if (
      !aiState
    ) {

      return;

    }


    switch (
      aiState
    ) {

      case "listening":

        if (
          avatarEngine.getState() !==
          "LISTENING"
        ) {

          avatarEngine.startListening();

        }

        break;


      case "thinking":

        if (
          avatarEngine.getState() !==
          "THINKING"
        ) {

          avatarEngine.startThinking();

        }

        break;


      case "speaking":

        if (
          avatarEngine.getState() !==
          "SPEAKING"
        ) {

          avatarEngine.startSpeaking();

        }

        break;


      default:

        if (
          avatarEngine.getState() !==
          "IDLE"
        ) {

          avatarEngine.idle();

        }

        break;

    }

  }, [
    systemState?.ai
  ]);


  /* =================================================
     INTRODUCTION
     ================================================= */

  if (
    showIntro
  ) {

    return (

      <Box

        sx={{

          width:
            "100%",

          height:
            "100%",

          minHeight:
            500,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          background:
            BG,

        }}

      >

        <Box

          sx={{

            width:
              "100%",

            maxWidth:
              980,

            px:
              2,

          }}

        >

          <CompositionStage

            width={
              1920
            }

            height={
              1080
            }

            bg={
              BG
            }

          >

            <Piece
              hud={true}
            />

          </CompositionStage>

        </Box>

      </Box>

    );

  }


  /* =================================================
     AVATAR VIVANT
     ================================================= */

  return (

    <Box

      sx={{

        width:
          "100%",

        height:
          "100%",

        minHeight:
          500,

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        position:
          "relative",

        overflow:
          "hidden",

        background:

          "radial-gradient(circle at center, #172b43 0%, #0b1220 65%)",

      }}

    >

      <LyssiaAvatar

        avatarEngine={
          avatarEngine
        }

        lipSyncController={
          lipSyncController
        }

        animationController={
          animationController
        }

        imageSrc={
          portraitImg
        }

      />

    </Box>

  );

}