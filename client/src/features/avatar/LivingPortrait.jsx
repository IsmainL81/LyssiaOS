import React, {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Typography,
} from "@mui/material";

import { useVision } from "../vision/VisionContext";


export default function LivingPortrait() {

  /*
   * =====================================================
   * VISION
   * =====================================================
   */

  const {
    visionState,
  } = useVision();

  const visionActive =
    visionState === "online" ||
    visionState === "thinking";

  const visionThinking =
    visionState === "thinking";


  /*
   * =====================================================
   * ÉTATS VISUELS
   * =====================================================
   */

  const [
    currentState,
    setCurrentState,
  ] = useState("idle");

  const isSpeaking =
    currentState === "speaking";

  const isListening =
    currentState === "listening";

  const isThinking =
    currentState === "thinking";


  /*
   * =====================================================
   * CLIGNEMENT
   * =====================================================
   */

  const [
    blink,
    setBlink,
  ] = useState(false);

  useEffect(() => {

    let blinkTimeout;
    let blinkInterval;

    const scheduleBlink = () => {

      /*
       * Petit délai aléatoire afin que les clignements
       * ne soient pas parfaitement mécaniques.
       */

      const delay =
        3200 +
        Math.random() * 2800;

      blinkTimeout =
        setTimeout(() => {

          setBlink(true);

          setTimeout(() => {
            setBlink(false);
          }, 120);

          scheduleBlink();

        }, delay);
    };

    scheduleBlink();

    return () => {

      clearTimeout(
        blinkTimeout
      );

      clearInterval(
        blinkInterval
      );
    };

  }, []);


  /*
   * =====================================================
   * REGARD
   * =====================================================
   */

  const [
    gaze,
    setGaze,
  ] = useState("center");


  useEffect(() => {

    let gazeInterval;

    if (visionThinking) {

      gazeInterval =
        setInterval(() => {

          setGaze(
            (previous) => {

              if (
                previous ===
                "center"
              ) {
                return "right";
              }

              if (
                previous ===
                "right"
              ) {
                return "left";
              }

              return "center";
            }
          );

        }, 1100);

    } else if (isThinking) {

      gazeInterval =
        setInterval(() => {

          setGaze(
            (previous) => {

              if (
                previous ===
                "center"
              ) {
                return "right";
              }

              if (
                previous ===
                "right"
              ) {
                return "left";
              }

              return "center";
            }
          );

        }, 1650);

    } else if (isListening) {

      gazeInterval =
        setInterval(() => {

          setGaze(
            (previous) => {

              if (
                previous ===
                "center"
              ) {
                return "slight-right";
              }

              if (
                previous ===
                "slight-right"
              ) {
                return "center";
              }

              return "center";
            }
          );

        }, 2200);

    } else if (isSpeaking) {

      gazeInterval =
        setInterval(() => {

          setGaze(
            (previous) => {

              if (
                previous ===
                "center"
              ) {
                return "slight-right";
              }

              if (
                previous ===
                "slight-right"
              ) {
                return "center";
              }

              return "center";
            }
          );

        }, 1900);

    } else if (visionActive) {

      gazeInterval =
        setInterval(() => {

          setGaze(
            (previous) => {

              if (
                previous ===
                "center"
              ) {
                return "slight-right";
              }

              return "center";
            }
          );

        }, 2700);

    } else {

      setGaze(
        "center"
      );
    }

    return () => {

      if (
        gazeInterval
      ) {

        clearInterval(
          gazeInterval
        );
      }
    };

  }, [
    currentState,
    visionActive,
    visionThinking,
    isSpeaking,
    isListening,
    isThinking,
  ]);


  /*
   * =====================================================
   * POSITION DU REGARD
   * =====================================================
   */

  const gazePosition = {

    center:
      "50% 50%",

    "slight-right":
      "50.4% 50%",

    right:
      "51% 50%",

    left:
      "49% 50%",
  };


  /*
   * =====================================================
   * APPARENCE VISION
   * =====================================================
   */

  const portraitScale =
    visionThinking
      ? 1.018
      : visionActive
        ? 1.008
        : 1;

  const visionHaloOpacity =
    visionThinking
      ? 0.2
      : visionActive
        ? 0.09
        : 0;


  /*
   * =====================================================
   * ANIMATION PAR ÉTAT
   * =====================================================
   */

  const portraitAnimation =
    isSpeaking
      ? "lyssiaSpeaking 1.15s ease-in-out infinite"
      : isListening
        ? "lyssiaListening 3.2s ease-in-out infinite"
        : isThinking
          ? "lyssiaThinking 3.8s ease-in-out infinite"
          : visionThinking
            ? "lyssiaVisionPresence 1.8s ease-in-out infinite"
            : "lyssiaPresence 5s ease-in-out infinite";


  /*
   * =====================================================
   * ÉTAT VISUEL
   * =====================================================
   */

  const state = {

    color:
      isSpeaking
        ? "#59d9ff"
        : isListening
          ? "#ffd166"
          : isThinking
            ? "#a78bfa"
            : visionThinking
              ? "#59d9ff"
              : visionActive
                ? "#59d9ff"
                : "#59d9ff",

    label:
      isSpeaking
        ? "PARLE"
        : isListening
          ? "ÉCOUTE"
          : isThinking
            ? "RÉFLEXION"
            : visionThinking
              ? "ANALYSE"
              : visionActive
                ? "VISION"
                : "EN VEILLE",

    haloOpacity:
      isSpeaking
        ? 0.25
        : isListening
          ? 0.2
          : isThinking
            ? 0.2
            : visionThinking
              ? 0.2
              : visionActive
                ? 0.09
                : 0.08,

    haloScale:
      isSpeaking
        ? 1.06
        : isListening
          ? 1.04
          : isThinking
            ? 1.05
            : visionThinking
              ? 1.13
              : 1.03,

    haloDuration:
      isSpeaking
        ? "1.15s"
        : isListening
          ? "3.2s"
          : isThinking
            ? "3.8s"
            : "2.8s",
  };


  /*
   * =====================================================
   * RENDU
   * =====================================================
   */

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

        flexDirection:
          "column",

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


        /*
         * =================================================
         * ANIMATIONS
         * =================================================
         */

        "@keyframes lyssiaPresence": {

          "0%, 100%": {

            transform:
              "translateY(0px) scale(1)",
          },

          "50%": {

            transform:
              "translateY(-2px) scale(1.006)",
          },
        },


        "@keyframes lyssiaSpeaking": {

          "0%, 100%": {

            transform:
              "translateY(0px) scale(1)",
          },

          "25%": {

            transform:
              "translateY(-1px) scale(1.009)",
          },

          "50%": {

            transform:
              "translateY(-3px) scale(1.018)",
          },

          "75%": {

            transform:
              "translateY(-1px) scale(1.008)",
          },
        },


        "@keyframes lyssiaListening": {

          "0%, 100%": {

            transform:
              "translateY(0px) scale(1)",
          },

          "50%": {

            transform:
              "translateY(-2px) scale(1.01)",
          },
        },


        "@keyframes lyssiaThinking": {

          "0%, 100%": {

            transform:
              "translateY(0px) scale(1)",
          },

          "50%": {

            transform:
              "translateY(-1px) scale(1.012)",
          },
        },


        "@keyframes lyssiaVisionPresence": {

          "0%, 100%": {

            transform:
              "translateY(0px) scale(1)",
          },

          "50%": {

            transform:
              "translateY(-2px) scale(1.014)",
          },
        },


        "@keyframes lyssiaHalo": {

          "0%, 100%": {

            transform:
              "scale(0.94)",

            opacity:
              state.haloOpacity *
              0.72,
          },

          "50%": {

            transform:
              `scale(${state.haloScale})`,

            opacity:
              state.haloOpacity,
          },
        },


        "@keyframes lyssiaVisionHalo": {

          "0%, 100%": {

            opacity:
              visionHaloOpacity *
              0.55,

            transform:
              "scale(0.98)",
          },

          "50%": {

            opacity:
              visionHaloOpacity,

            transform:
              visionThinking
                ? "scale(1.13)"
                : "scale(1.05)",
          },
        },


        "@keyframes lyssiaSpeakingGlow": {

          "0%, 100%": {

            opacity:
              0.15,

            transform:
              "scale(0.98)",
          },

          "50%": {

            opacity:
              0.4,

            transform:
              "scale(1.06)",
          },
        },


        "@keyframes lyssiaListeningGlow": {

          "0%, 100%": {

            opacity:
              0.12,

            transform:
              "scale(0.98)",
          },

          "50%": {

            opacity:
              0.28,

            transform:
              "scale(1.04)",
          },
        },
      }}
    >


      {/* =================================================
          HALO PRINCIPAL
         ================================================= */}

      <Box
        sx={{

          position:
            "absolute",

          width:
            360,

          height:
            360,

          borderRadius:
            "50%",

          background:
            `radial-gradient(
              circle,
              ${state.color}3d 0%,
              ${state.color}14 40%,
              transparent 72%
            )`,

          filter:
            "blur(18px)",

          animation:
            `lyssiaHalo ${state.haloDuration} ease-in-out infinite`,

          transition:
            "background 500ms ease, opacity 500ms ease",
        }}
      />


      {/* =================================================
          HALO VISION
         ================================================= */}

      <Box
        sx={{

          position:
            "absolute",

          width:
            430,

          height:
            430,

          borderRadius:
            "50%",

          background:
            "radial-gradient(circle, rgba(89,217,255,0.22) 0%, rgba(89,217,255,0.07) 38%, transparent 72%)",

          filter:
            "blur(28px)",

          opacity:
            visionHaloOpacity,

          transform:
            visionThinking
              ? "scale(1.08)"
              : visionActive
                ? "scale(1.02)"
                : "scale(0.96)",

          animation:
            visionActive
              ? "lyssiaVisionHalo 2.2s ease-in-out infinite"
              : "none",

          transition:
            "opacity 500ms ease, transform 700ms ease",
        }}
      />


      {/* =================================================
          HALO PAROLE
         ================================================= */}

      <Box
        sx={{

          position:
            "absolute",

          width:
            390,

          height:
            390,

          borderRadius:
            "50%",

          background:
            "radial-gradient(circle, rgba(89,217,255,0.16) 0%, rgba(89,217,255,0.04) 42%, transparent 72%)",

          filter:
            "blur(22px)",

          opacity:
            isSpeaking
              ? 1
              : 0,

          animation:
            isSpeaking
              ? "lyssiaSpeakingGlow 1.15s ease-in-out infinite"
              : "none",

          transition:
            "opacity 400ms ease",
        }}
      />


      {/* =================================================
          HALO ÉCOUTE
         ================================================= */}

      <Box
        sx={{

          position:
            "absolute",

          width:
            390,

          height:
            390,

          borderRadius:
            "50%",

          background:
            "radial-gradient(circle, rgba(255,209,102,0.13) 0%, rgba(255,209,102,0.035) 42%, transparent 72%)",

          filter:
            "blur(22px)",

          opacity:
            isListening
              ? 1
              : 0,

          animation:
            isListening
              ? "lyssiaListeningGlow 3.2s ease-in-out infinite"
              : "none",

          transition:
            "opacity 400ms ease",
        }}
      />


      {/* =================================================
          PORTRAIT
         ================================================= */}

      <Box
        sx={{

          position:
            "relative",

          width:
            "min(72%, 360px)",

          aspectRatio:
            "3 / 4",

          borderRadius:
            5,

          overflow:
            "hidden",

          zIndex:
            2,

          border:
            `1px solid ${state.color}73`,

          boxShadow:
            `
              0 0 25px ${state.color}38,
              0 0 55px ${state.color}18
            `,

          animation:
            portraitAnimation,

          transform:
            `scale(${portraitScale})`,

          transition:
            "border-color 400ms ease, box-shadow 400ms ease, transform 500ms ease",
        }}
      >

        <Box
          component="img"

          src="/lyssia-avatar.png"

          alt="Lyssia"

          sx={{

            width:
              "102%",

            height:
              "102%",

            objectFit:
              "cover",

            display:
              "block",

            position:
              "absolute",

            left:
              "-1%",

            top:
              "-1%",

            objectPosition:
              gazePosition[
                gaze
              ],

            transition:
              "object-position 900ms ease-in-out",
          }}
        />


        {/* =================================================
            CLIGNEMENT
           ================================================= */}

        <Box
          sx={{

            position:
              "absolute",

            inset:
              0,

            pointerEvents:
              "none",

            opacity:
              blink
                ? 1
                : 0,

            transition:
              blink
                ? "opacity 35ms linear"
                : "opacity 100ms linear",

            background:
              "linear-gradient(to bottom, transparent 0%, transparent 31%, rgba(24,31,42,0.96) 34%, rgba(24,31,42,0.96) 38%, transparent 41%, transparent 100%)",
          }}
        />


        {/* =================================================
            INDICATEUR VISION
           ================================================= */}

        {visionActive && (

          <Box
            sx={{

              position:
                "absolute",

              top:
                14,

              right:
                14,

              px:
                1.2,

              py:
                0.6,

              borderRadius:
                2,

              background:
                "rgba(8,13,23,0.78)",

              border:
                "1px solid rgba(89,217,255,0.35)",

              boxShadow:
                "0 0 15px rgba(89,217,255,0.12)",
            }}
          >

            <Typography
              sx={{

                fontSize:
                  10,

                fontWeight:
                  700,

                letterSpacing:
                  1,

                color:
                  "#59d9ff",
              }}
            >
              {visionThinking
                ? "👁️ ANALYSE"
                : "👁️ VISION"}
            </Typography>

          </Box>
        )}


        {/* =================================================
            INDICATEUR PAROLE
           ================================================= */}

        {isSpeaking && (

          <Box
            sx={{

              position:
                "absolute",

              bottom:
                14,

              left:
                14,

              px:
                1.2,

              py:
                0.6,

              borderRadius:
                2,

              background:
                "rgba(8,13,23,0.78)",

              border:
                "1px solid rgba(89,217,255,0.35)",

              boxShadow:
                "0 0 15px rgba(89,217,255,0.12)",
            }}
          >

            <Typography
              sx={{

                fontSize:
                  10,

                fontWeight:
                  700,

                letterSpacing:
                  1,

                color:
                  "#59d9ff",
              }}
            >
              🗣️ PAROLE
            </Typography>

          </Box>
        )}


        {/* =================================================
            INDICATEUR ÉCOUTE
           ================================================= */}

        {isListening && (

          <Box
            sx={{

              position:
                "absolute",

              bottom:
                14,

              left:
                14,

              px:
                1.2,

              py:
                0.6,

              borderRadius:
                2,

              background:
                "rgba(8,13,23,0.78)",

              border:
                "1px solid rgba(255,209,102,0.35)",

              boxShadow:
                "0 0 15px rgba(255,209,102,0.12)",
            }}
          >

            <Typography
              sx={{

                fontSize:
                  10,

                fontWeight:
                  700,

                letterSpacing:
                  1,

                color:
                  "#ffd166",
              }}
            >
              🎙️ ÉCOUTE
            </Typography>

          </Box>
        )}

      </Box>


      {/* =================================================
          NOM
         ================================================= */}

      <Typography
        sx={{

          mt:
            2,

          fontSize:
            30,

          fontWeight:
            700,

          letterSpacing:
            5,

          color:
            "white",

          zIndex:
            2,

          textShadow:
            isSpeaking
              ? "0 0 18px rgba(89,217,255,0.35)"
              : "none",

          transition:
            "text-shadow 400ms ease",
        }}
      >
        LYSSIA
      </Typography>


      {/* =================================================
          STATUT
         ================================================= */}

      <Box
        sx={{

          display:
            "flex",

          alignItems:
            "center",

          gap:
            1,

          mt:
            1,

          zIndex:
            2,
        }}
      >

        <Box
          sx={{

            width:
              9,

            height:
              9,

            borderRadius:
              "50%",

            backgroundColor:
              state.color,

            boxShadow:
              `0 0 12px ${state.color}`,

            animation:
              isSpeaking
                ? "lyssiaSpeakingGlow 1.15s ease-in-out infinite"
                : "none",

            transition:
              "background-color 400ms ease, box-shadow 400ms ease",
          }}
        />

        <Typography
          sx={{

            color:
              state.color,

            fontSize:
              14,

            letterSpacing:
              1,

            transition:
              "color 400ms ease",
          }}
        >
          {state.label}
        </Typography>

      </Box>

    </Box>
  );
}