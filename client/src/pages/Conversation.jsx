import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";

import {
  Box,
  Button,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";

import { askLyssia } from "../features/ai/AIEngine";
import { useLyssia } from "../core/LyssiaCore";
import { useVision } from "../features/vision/VisionContext";
import { performVisionRequest } from "../features/vision/visionRequest";

import {
  analyzeMessage,
  prepareCognitiveContext,
} from "../core/CognitiveEngine";

import {
  orchestrateCognition,
} from "../core/CognitiveEngine.v2.js";

import {
  isVoiceSupported,
  isListeningSupported,
  createListeningSession,
  startListening,
  stopListening,
  speak,
  stopSpeaking,
} from "../features/voice/VoiceEngine";

/**
 * =====================================================
 * PAGE CONVERSATION
 * =====================================================
 * Systeme vocal autonome, separe du chat texte (ChatPanel).
 *
 * Principe : demarrage explicite (clic), puis boucle
 * automatique tant que la session est active --
 * ecoute -> reflexion -> parole -> ecoute -- sans reclic
 * entre les tours. La reconnaissance tourne en continu
 * y compris pendant que Lyssia parle, ce qui permet une
 * interruption reelle (barge-in) via onSpeechActivity.
 *
 * Un seul redemarrage propre par coupure naturelle de la
 * reconnaissance (onEnd/onError du navigateur) -- jamais
 * de relances empilees.
 */

const PHASE = {
  IDLE: "idle",
  LISTENING: "listening",
  THINKING: "thinking",
  SPEAKING: "speaking",
};

const PHASE_META = {
  idle: { label: "En pause", color: "#5a6b80" },
  listening: { label: "À l'écoute", color: "#5ab6d8" },
  thinking: { label: "Réflexion", color: "#e2a45f" },
  speaking: { label: "Lyssia parle", color: "#5ab6d8" },
};

export default function Conversation() {
  const { rememberExchange, memories } = useLyssia();
  const { visionController } = useVision();

  const [phase, setPhase] = useState(PHASE.IDLE);
  const [transcript, setTranscript] = useState([]);
  const [liveText, setLiveText] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const sessionActiveRef = useRef(false);
  const phaseRef = useRef(PHASE.IDLE);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  const supported =
    isVoiceSupported() && isListeningSupported();

  function transitionTo(newPhase) {
    phaseRef.current = newPhase;
    setPhase(newPhase);
  }

  const runListeningCycle = useCallback(() => {
    if (!sessionActiveRef.current) return;

    try {
      const session = createListeningSession({
        language: "fr-FR",
        continuous: true,
        interimResults: true,

        onStart: () => {
          if (phaseRef.current !== PHASE.THINKING) {
            transitionTo(PHASE.LISTENING);
          }
          setErrorMsg(null);
        },

        onInterimResult: (text) => {
          setLiveText(text);
        },

        onSpeechActivity: () => {
          if (phaseRef.current === PHASE.SPEAKING) {
            stopSpeaking();
            transitionTo(PHASE.LISTENING);
          }
        },

        onFinalResult: async (text) => {
          setLiveText("");

          if (!text || !text.trim()) return;
          if (!sessionActiveRef.current) return;
          if (phaseRef.current === PHASE.THINKING) return;

          transitionTo(PHASE.THINKING);

          setTranscript((prev) => [
            ...prev,
            { role: "user", text },
          ]);

          const cognitivePlan =
            orchestrateCognition({
              message: text,
              memories,
            });

          const isVisionRequest =
            cognitivePlan.route === "vision" &&
            cognitivePlan.action === "observe";

          try {
            let reply;

            if (isVisionRequest) {
              /*
               * Vision déclenchée à voix haute -- même
               * coeur que ChatPanel (performVisionRequest).
               * La mémorisation se fait déjà à l'intérieur
               * de captureAndAnalyze, pas besoin de
               * rememberExchange ici.
               */
              reply = await performVisionRequest(
                visionController,
                text
              );
            } else {
              const cognition =
                analyzeMessage(text, memories);

              const cognitiveContext =
                prepareCognitiveContext({
                  message: text,
                  cognition,
                  memories,
                });

              reply = await askLyssia(
                text,
                cognitiveContext
              );
            }

            if (!sessionActiveRef.current) return;

            setTranscript((prev) => [
              ...prev,
              { role: "lyssia", text: reply },
            ]);

            if (!isVisionRequest) {
              rememberExchange(text, reply);
            }

            transitionTo(PHASE.SPEAKING);

            speak(reply, {
              onEnd: () => {
                if (sessionActiveRef.current) {
                  transitionTo(PHASE.LISTENING);
                }
              },
            });
          } catch (err) {
            setErrorMsg(
              err.message ||
                "Erreur de communication avec Lyssia."
            );

            if (sessionActiveRef.current) {
              transitionTo(PHASE.LISTENING);
            }
          }
        },

        onEnd: () => {
          recognitionRef.current = null;

          if (sessionActiveRef.current) {
            runListeningCycle();
          }
        },

        onError: (err) => {
          console.warn(
            "Reconnaissance vocale — erreur :",
            err
          );

          recognitionRef.current = null;

          if (sessionActiveRef.current) {
            runListeningCycle();
          }
        },
      });

      recognitionRef.current = session;
      startListening(session);
    } catch (err) {
      setErrorMsg(err.message);
      sessionActiveRef.current = false;
      transitionTo(PHASE.IDLE);
    }
  }, []);

  function handleStart() {
    setTranscript([]);
    setErrorMsg(null);
    sessionActiveRef.current = true;
    runListeningCycle();
  }

  function handleStop() {
    sessionActiveRef.current = false;
    stopSpeaking();

    if (recognitionRef.current) {
      stopListening(recognitionRef.current);
      recognitionRef.current = null;
    }

    setLiveText("");
    transitionTo(PHASE.IDLE);
  }

  useEffect(() => {
    return () => {
      sessionActiveRef.current = false;
      stopSpeaking();
      if (recognitionRef.current) {
        stopListening(recognitionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [transcript, liveText]);

  const meta = PHASE_META[phase];
  const isActive = phase !== PHASE.IDLE;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background:
          "radial-gradient(circle at 50% 30%, #172b43 0%, #0b1220 70%)",
        color: "#f2efe9",
        px: 3,
        py: 5,
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, letterSpacing: "-0.01em", mb: 1 }}
      >
        Conversation vocale
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "rgba(242,239,233,0.5)", mb: 4 }}
      >
        Système séparé du chat texte — écoute continue,
        tours automatiques, interruption possible.
      </Typography>

      {!supported && (
        <Box
          sx={{
            border: "1px solid rgba(226,164,95,0.4)",
            borderRadius: 2,
            p: 2,
            mb: 3,
            maxWidth: 480,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "#e2a45f" }}>
            La reconnaissance ou la synthèse vocale n'est
            pas disponible dans ce navigateur.
          </Typography>
        </Box>
      )}

      {/* =================================================
          INDICATEUR D'ÉTAT
         ================================================= */}

      <Box
        sx={{
          position: "relative",
          width: 180,
          height: 180,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,

          border: `2px solid ${meta.color}88`,

          boxShadow: isActive
            ? `0 0 40px 6px ${meta.color}44`
            : "none",

          transition:
            "border-color 400ms ease, box-shadow 400ms ease",

          "@keyframes convPulse": {
            "0%, 100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.06)" },
          },

          animation:
            phase === PHASE.LISTENING || phase === PHASE.SPEAKING
              ? "convPulse 1.8s ease-in-out infinite"
              : "none",
        }}
      >
        {phase === PHASE.THINKING ? (
          <GraphicEqIcon
            sx={{ fontSize: 56, color: meta.color, opacity: 0.85 }}
          />
        ) : (
          <MicIcon
            sx={{ fontSize: 56, color: meta.color, opacity: 0.85 }}
          />
        )}
      </Box>

      <Chip
        label={meta.label}
        sx={{
          mb: 3,
          bgcolor: `${meta.color}22`,
          color: meta.color,
          border: `1px solid ${meta.color}55`,
          fontWeight: 600,
        }}
      />

      {liveText && (
        <Typography
          variant="body2"
          sx={{
            color: "rgba(242,239,233,0.6)",
            fontStyle: "italic",
            mb: 2,
            minHeight: 20,
          }}
        >
          « {liveText} »
        </Typography>
      )}

      {errorMsg && (
        <Typography
          variant="body2"
          sx={{ color: "#e2685f", mb: 2 }}
        >
          {errorMsg}
        </Typography>
      )}

      {/* =================================================
          COMMANDE
         ================================================= */}

      {!isActive ? (
        <Button
          variant="contained"
          startIcon={<MicIcon />}
          disabled={!supported}
          onClick={handleStart}
          sx={{
            bgcolor: "#5ab6d8",
            "&:hover": { bgcolor: "#4a9fc0" },
            borderRadius: 3,
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Démarrer la conversation
        </Button>
      ) : (
        <Button
          variant="outlined"
          startIcon={<StopIcon />}
          onClick={handleStop}
          sx={{
            borderColor: "rgba(242,239,233,0.3)",
            color: "#f2efe9",
            "&:hover": {
              borderColor: "#e2685f",
              color: "#e2685f",
            },
            borderRadius: 3,
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Arrêter
        </Button>
      )}

      {/* =================================================
          TRANSCRIPT LÉGER
         ================================================= */}

      <Box
        ref={scrollRef}
        sx={{
          width: "100%",
          maxWidth: 640,
          mt: 5,
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {transcript.map((entry, index) => (
          <Stack
            key={index}
            direction="row"
            justifyContent={
              entry.role === "user" ? "flex-end" : "flex-start"
            }
          >
            <Box
              sx={{
                maxWidth: "80%",
                px: 2,
                py: 1,
                borderRadius: 2.5,
                bgcolor:
                  entry.role === "user"
                    ? "rgba(90,182,216,0.16)"
                    : "rgba(242,239,233,0.06)",
                border:
                  entry.role === "user"
                    ? "1px solid rgba(90,182,216,0.3)"
                    : "1px solid rgba(242,239,233,0.1)",
              }}
            >
              <Typography variant="body2">
                {entry.text}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}
