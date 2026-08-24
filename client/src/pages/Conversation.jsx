import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";

import {
  Box,
  IconButton,
  Typography,
  Chip,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";

import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";

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
 * PAGE CONVERSATION -- UNIFIÉE
 * =====================================================
 * Texte, voix et vision au même endroit, une seule liste
 * d'échanges. Plus de séparation entre "le chat" et "la
 * conversation" : un seul point d'entrée (handleUtterance)
 * traite un message quelle que soit sa modalité d'origine
 * (tapé ou parlé), route vers la vision si nécessaire, et
 * ne parle la réponse que si une session vocale est
 * active -- indépendamment de la façon dont le message est
 * arrivé.
 *
 * Utilisée à deux endroits : ancrée en bas du Dashboard
 * (compact, avatar au-dessus), et en plein écran sur la
 * route /conversation (compact=false). Même composant,
 * mêmes capacités, juste une mise en page adaptée.
 */

const MAX_ATTACHMENT_BYTES =
  20 * 1024 * 1024;

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

export default function Conversation({
  compact = false,
}) {
  const { rememberExchange, memories } = useLyssia();
  const { visionController } = useVision();

  const [phase, setPhase] = useState(PHASE.IDLE);
  const [messages, setMessages] = useState([
    {
      sender: "lyssia",
      text: "Bonjour Ismain. Je suis Lyssia. Comment puis-je t'aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [liveText, setLiveText] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const sessionActiveRef = useRef(false);
  const phaseRef = useRef(PHASE.IDLE);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const supported =
    isVoiceSupported() && isListeningSupported();

  function transitionTo(newPhase) {
    phaseRef.current = newPhase;
    setPhase(newPhase);
  }

  /*
   * =====================================================
   * PIÈCE JOINTE
   * =====================================================
   */

  function handleFileSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setMessages((previous) => [
        ...previous,
        {
          sender: "lyssia",
          text: "Ce fichier dépasse 20 Mo, je ne peux pas le joindre.",
        },
      ]);
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      setMessages((previous) => [
        ...previous,
        {
          sender: "lyssia",
          text: "Je ne peux joindre que des images ou des PDF pour l'instant.",
        },
      ]);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAttachment({
        data: reader.result,
        filename: file.name,
        isImage,
      });
    };

    reader.onerror = () => {
      console.warn("Impossible de lire le fichier :", reader.error);
    };

    reader.readAsDataURL(file);
  }

  function clearAttachment() {
    setAttachment(null);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  /*
   * =====================================================
   * TRAITEMENT UNIFIÉ D'UN ÉCHANGE
   * =====================================================
   * Point d'entrée unique, quelle que soit la modalité
   * d'origine (texte tapé ou voix reconnue). Ne parle la
   * réponse que si une session vocale est active.
   */

  const handleUtterance = useCallback(
    async (rawText, attachmentToSend = null) => {
      if (phaseRef.current === PHASE.THINKING) return;

      const userText = rawText?.trim() || "";

      if (!userText && !attachmentToSend) return;

      const userMessage =
        userText ||
        (attachmentToSend?.isImage
          ? "Voici une image."
          : "Voici un document.");

      if (phaseRef.current === PHASE.SPEAKING) {
        stopSpeaking();
      }

      setMessages((previous) => [
        ...previous,
        { sender: "user", text: userMessage, attachment: attachmentToSend },
      ]);

      transitionTo(PHASE.THINKING);
      setErrorMsg(null);

      const cognitivePlan = orchestrateCognition({
        message: userMessage,
        memories,
      });

      const isVisionRequest =
        !attachmentToSend &&
        cognitivePlan.route === "vision" &&
        cognitivePlan.action === "observe";

      try {
        let reply;

        if (isVisionRequest) {
          /*
           * Mémorisée automatiquement dans
           * captureAndAnalyze -> analyzeImageData.
           */
          reply = await performVisionRequest(
            visionController,
            userMessage
          );
        } else {
          const cognition = analyzeMessage(userMessage, memories);

          const cognitiveContext = prepareCognitiveContext({
            message: userMessage,
            cognition,
            memories,
          });

          reply = await askLyssia(
            userMessage,
            cognitiveContext,
            attachmentToSend
          );
        }

        if (!reply || !reply.trim()) {
          throw new Error("Réponse vide de Lyssia.");
        }

        setMessages((previous) => [
          ...previous,
          { sender: "lyssia", text: reply },
        ]);

        if (!isVisionRequest) {
          rememberExchange(userMessage, reply);
        }

        if (sessionActiveRef.current) {
          transitionTo(PHASE.SPEAKING);

          speak(reply, {
            onEnd: () => {
              if (sessionActiveRef.current) {
                transitionTo(PHASE.LISTENING);
              }
            },
          });
        } else {
          transitionTo(PHASE.IDLE);
        }
      } catch (err) {
        console.error("Erreur Lyssia :", err);

        setErrorMsg(
          err.message || "Erreur de communication avec Lyssia."
        );

        setMessages((previous) => [
          ...previous,
          {
            sender: "lyssia",
            text: "Je rencontre un problème pour répondre.",
          },
        ]);

        transitionTo(
          sessionActiveRef.current ? PHASE.LISTENING : PHASE.IDLE
        );
      }
    },
    [memories, visionController, rememberExchange]
  );

  /*
   * =====================================================
   * ENVOI PAR TEXTE
   * =====================================================
   */

  async function sendMessage() {
    if (
      (!input.trim() && !attachment) ||
      phaseRef.current === PHASE.THINKING
    ) {
      return;
    }

    const textToSend = input;
    const attachmentToSend = attachment;

    setInput("");
    setAttachment(null);

    await handleUtterance(textToSend, attachmentToSend);
  }

  /*
   * =====================================================
   * BOUCLE D'ÉCOUTE VOCALE
   * =====================================================
   * Démarrage explicite, puis tours automatiques tant que
   * la session est active. Reconnaissance continue, y
   * compris pendant que Lyssia parle (barge-in via
   * onSpeechActivity). Un seul redémarrage propre par
   * coupure naturelle -- jamais de relances empilées.
   */

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

          await handleUtterance(text, null);
        },

        onEnd: () => {
          recognitionRef.current = null;

          if (sessionActiveRef.current) {
            runListeningCycle();
          }
        },

        onError: (err) => {
          console.warn("Reconnaissance vocale — erreur :", err);

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
  }, [handleUtterance]);

  function toggleVoiceSession() {
    if (sessionActiveRef.current) {
      sessionActiveRef.current = false;
      stopSpeaking();

      if (recognitionRef.current) {
        stopListening(recognitionRef.current);
        recognitionRef.current = null;
      }

      setLiveText("");
      transitionTo(PHASE.IDLE);
    } else {
      sessionActiveRef.current = true;
      setErrorMsg(null);
      runListeningCycle();
    }
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

  /*
   * =====================================================
   * DÉMARRAGE AUTOMATIQUE SI PERMISSION DÉJÀ ACCORDÉE
   * =====================================================
   * Un navigateur exige un geste utilisateur pour LA
   * TOUTE PREMIÈRE autorisation micro -- incontournable,
   * ce n'est pas un choix de Lyssia OS. Mais une fois
   * cette autorisation accordée pour cette origine, la
   * réactiver n'en a plus besoin. On vérifie l'état réel
   * via la Permissions API (lecture seule, ne déclenche
   * jamais de prompt) et on ne démarre que si elle est
   * déjà "granted".
   *
   * Différent de la tentative du matin : ici la relance
   * est unique, conditionnée à la permission, et repose
   * sur runListeningCycle -- déjà à l'épreuve du
   * redémarrage propre (un seul relais par coupure
   * naturelle, jamais de relances empilées).
   */

  useEffect(() => {
    let cancelled = false;

    async function tryAutoStart() {
      if (!supported || sessionActiveRef.current) return;

      if (!navigator.permissions?.query) {
        return;
      }

      try {
        const status = await navigator.permissions.query({
          name: "microphone",
        });

        if (
          !cancelled &&
          status.state === "granted" &&
          !sessionActiveRef.current
        ) {
          sessionActiveRef.current = true;
          setErrorMsg(null);
          runListeningCycle();
        }
      } catch {
        /*
         * Permissions API indisponible pour 'microphone'
         * (Firefox notamment) -- on ne prend aucun risque,
         * le bouton micro reste le point de départ manuel.
         */
      }
    }

    tryAutoStart();

    return () => {
      cancelled = true;
    };
  }, [supported, runListeningCycle]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveText]);

  const meta = PHASE_META[phase];
  const voiceActive = sessionActiveRef.current;

  /*
   * =====================================================
   * INTERFACE
   * =====================================================
   */

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: "#f2efe9",
        boxSizing: "border-box",
        borderRadius: compact ? 4 : 0,
        overflow: "hidden",
        background: compact
          ? "rgba(8,15,27,0.82)"
          : "radial-gradient(circle at 50% 25%, #172b43 0%, #0b1220 70%)",
        backdropFilter: compact ? "blur(16px)" : "none",
        border: compact ? "1px solid rgba(148,163,184,0.14)" : "none",
      }}
    >
      {!compact && (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pt: 4,
              pb: 2,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: 120,
                height: 120,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                border: `2px solid ${meta.color}88`,
                boxShadow:
                  phase !== PHASE.IDLE
                    ? `0 0 32px 5px ${meta.color}44`
                    : "none",
                transition: "border-color 400ms ease, box-shadow 400ms ease",
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
                  sx={{ fontSize: 40, color: meta.color, opacity: 0.85 }}
                />
              ) : (
                <MicIcon
                  sx={{ fontSize: 40, color: meta.color, opacity: 0.85 }}
                />
              )}
            </Box>

            <Chip
              label={meta.label}
              sx={{
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
                  mt: 1.5,
                }}
              >
                « {liveText} »
              </Typography>
            )}

            {errorMsg && (
              <Typography
                variant="body2"
                sx={{ color: "#e2685f", mt: 1 }}
              >
                {errorMsg}
              </Typography>
            )}
          </Box>
        </>
      )}

      {/* =================================================
          HISTORIQUE
         ================================================= */}

      {!compact && (
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3,
            pb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {messages.map((message, index) => (
            <Stack
              key={index}
              direction="row"
              justifyContent={
                message.sender === "user" ? "flex-end" : "flex-start"
              }
            >
              <Box
                sx={{
                  maxWidth: "80%",
                  px: 2,
                  py: 1.2,
                  borderRadius: 2.5,
                  bgcolor:
                    message.sender === "user"
                      ? "rgba(90,182,216,0.16)"
                      : "rgba(242,239,233,0.06)",
                  border:
                    message.sender === "user"
                      ? "1px solid rgba(90,182,216,0.3)"
                      : "1px solid rgba(242,239,233,0.1)",
                }}
              >
                {message.attachment && (
                  message.attachment.isImage ? (
                    <Box
                      component="img"
                      src={message.attachment.data}
                      alt={message.attachment.filename || "Pièce jointe"}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: 220,
                        borderRadius: 2,
                        display: "block",
                        mb: message.text ? 1 : 0,
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<DescriptionIcon />}
                      label={message.attachment.filename || "Document"}
                      size="small"
                      sx={{
                        mb: message.text ? 1 : 0,
                        bgcolor: "rgba(255,255,255,0.1)",
                        color: "white",
                      }}
                    />
                  )
                )}

                <Typography variant="body2">{message.text}</Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      )}

      {/* =================================================
          PIÈCE JOINTE EN ATTENTE
         ================================================= */}

      {attachment && (
        <Box sx={{ display: "flex", px: compact ? 1.5 : 3, pt: 1 }}>
          <Chip
            icon={
              attachment.isImage ? (
                <Box
                  component="img"
                  src={attachment.data}
                  sx={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <DescriptionIcon />
              )
            }
            label={attachment.filename}
            onDelete={clearAttachment}
            deleteIcon={<CloseIcon />}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "white", maxWidth: "100%" }}
          />
        </Box>
      )}

      {/* =================================================
          SAISIE
         ================================================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: compact ? 1 : 3,
          py: compact ? 1 : 2,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <Tooltip title={voiceActive ? "Arrêter l'écoute" : "Parler à Lyssia"}>
          <IconButton
            onClick={toggleVoiceSession}
            disabled={!supported}
            sx={{
              color: voiceActive ? "#ff647c" : "#9aa8bd",
            }}
          >
            {voiceActive ? <StopIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Joindre une image ou un PDF">
          <IconButton onClick={openFilePicker} sx={{ color: "#9aa8bd" }}>
            <AttachFileIcon />
          </IconButton>
        </Tooltip>

        <TextField
          fullWidth
          size={compact ? "small" : "medium"}
          value={input}
          placeholder="Écris ou parle à Lyssia..."
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          sx={{
            input: { color: "white" },
            fieldset: { borderColor: "#42526b" },
          }}
        />

        <IconButton
          color="primary"
          onClick={sendMessage}
          disabled={
            phase === PHASE.THINKING || (!input.trim() && !attachment)
          }
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
