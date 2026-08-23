import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

import { askLyssia } from "./AIEngine";

import {
  useLyssia,
} from "../../core/LyssiaCore";

import {
  isVoiceSupported,
  speak,
  stopSpeaking,
  isListeningSupported,
  createListeningSession,
} from "../voice/VoiceEngine";

import {
  useVision,
} from "../vision/VisionContext";

import {
  analyzeMessage,
  prepareCognitiveContext,
} from "../../core/CognitiveEngine";

import {
  orchestrateCognition,
} from "../../core/CognitiveEngine.v2.js";

import {
  executeCognitivePlan,
} from "../../core/CognitiveExecutor.js";

import {
  CONVERSATION_STATES,
  setConversationState,
} from "../../core/ConversationState";

export default function ChatPanel({
  compact = false,
}) {
  const {
  setSystemState,
  conversationState,
  updateConversationState:
    updateConversationStateCore,
  memories,
  searchMemories,
  addConversationMemory,
} = useLyssia();

  const {
    visionController,
  } = useVision();

  /*
   * =====================================================
   * ECOUTE CONTINUE - DEMARRAGE AUTOMATIQUE
   * =====================================================
   * Lance l'ecoute au montage plutot que d'attendre un
   * clic sur le micro. startVoiceListening() se relance
   * ensuite lui-meme (voir onEnd/onError de la session)
   * pour maintenir le micro actif en continu.
   */
  useEffect(() => {
    startVoiceListening();

    /*
     * Nettoyage requis pour StrictMode (qui monte,
     * demonte, puis remonte les effets en dev) et pour
     * un vrai demontage du composant -- sans ca, deux
     * sessions d'ecoute pourraient tourner en parallele.
     */
    return () => {
      stopVoiceListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [
    messages,
    setMessages,
  ] = useState([
    {
      sender: "lyssia",
      text:
        "Bonjour Ismain. Je suis Lyssia. Comment puis-je t'aider ?",
    },
  ]);

  const [
    input,
    setInput,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    listening,
    setListening,
  ] = useState(false);

  const [
    speaking,
    setSpeaking,
  ] = useState(false);

  const listeningSessionRef =
    useRef(null);

  const speechPauseTimerRef =
    useRef(null);

  const interruptingRef =
  useRef(false);

  function updateConversationState(state) {
  setConversationState(state);
  }

  /*
   * =====================================================
   * MÉMOIRE
   * =====================================================
   */

  function buildMemoryContext(
    userMessage
  ) {
    if (
      !Array.isArray(memories) ||
      memories.length === 0
    ) {
      return "";
    }

    /*
     * Recherche ciblée.
     *
     * Exemple :
     *
     * "qu'est-ce que tu as vu ?"
     *
     * pourra retrouver les souvenirs
     * de type vision.
     */

    let relevantMemories = [];

    try {
      relevantMemories =
        searchMemories(
          userMessage
        );
    } catch (error) {
      console.warn(
        "Erreur recherche mémoire :",
        error
      );
    }

    /*
     * Ajoute les souvenirs récents.
     */

    const recentMemories =
      memories.slice(
        0,
        8
      );

    /*
     * Fusion sans doublons.
     */

    const combined = [
      ...relevantMemories,
      ...recentMemories,
    ];

    const unique =
      combined.filter(
        (
          memory,
          index,
          array
        ) =>
          array.findIndex(
            (item) =>
              item.id ===
              memory.id
          ) === index
      );

    /*
     * Limite volontairement le contexte.
     *
     * On ne veut pas envoyer toute la mémoire
     * au modèle à chaque message.
     */

    const selected =
      unique.slice(
        0,
        12
      );

    if (
      selected.length === 0
    ) {
      return "";
    }

    const formatted =
      selected
        .map(
          (
            memory,
            index
          ) => {
            const type =
              memory.type ||
              "general";

            const date =
              memory.createdAt
                ? new Date(
                    memory.createdAt
                  ).toLocaleString(
                    "fr-FR"
                  )
                : "";

            return (
              `${index + 1}. ` +
              `[${type}] ` +
              `${memory.content}` +
              (date
                ? ` (${date})`
                : "")
            );
          }
        )
        .join("\n");

    return `
CONTEXTE MÉMOIRE DE LYSSIA
Tu disposes des souvenirs suivants provenant de ta mémoire locale.

${formatted}

Utilise ces souvenirs uniquement lorsqu'ils sont pertinents pour répondre à l'utilisateur.
Ne prétends jamais avoir un souvenir qui n'est pas présent dans cette liste.
Si un souvenir concerne une perception visuelle passée, indique clairement qu'il s'agit de ce que tu avais précédemment observé.
`;
  }

  /*
   * =====================================================
   * DÉTECTION DEMANDE MÉMOIRE
   * =====================================================
   */

  function isMemoryRequest(
    message
  ) {
    const normalized =
      message
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );

    const patterns = [
      "tu te souviens",
      "te souviens tu",
      "te souviens-tu",
      "souviens toi",
      "souviens-toi",
      "qu est ce que tu as vu",
      "quest ce que tu as vu",
      "qu'est ce que tu as vu",
      "que vois tu",
      "que voyais tu",
      "qu est ce que tu sais",
      "quest ce que tu sais",
      "qu'est ce que tu sais",
      "dans ta memoire",
      "dans tes souvenirs",
      "tes souvenirs",
      "ta memoire",
      "tu te rappelles",
      "rappelle toi",
      "rappelle-toi",
      "recemment",
      "recemment vu",
      "dernier souvenir",
      "derniers souvenirs",
    ];

    return patterns.some(
      (pattern) =>
        normalized.includes(
          pattern
        )
    );
  }

  /*
   * =====================================================
   * VOIX
   * =====================================================
   */

  async function speakResponse(
    text
  ) {
    if (!text?.trim()) {
      return;
    }

    if (
      !isVoiceSupported()
    ) {
      setSpeaking(false);

      updateConversationState(
        CONVERSATION_STATES.IDLE
    );

      setSystemState(
        (previous) => ({
          ...previous,
          ai: "online",
          voice: "offline",
        })
      );

      return;
    }

    interruptingRef.current =
      false;

    setSpeaking(true);

    setSystemState(
      (previous) => ({
        ...previous,
        ai: "speaking",
        voice: "speaking",
      })
    );

    updateConversationState(
      CONVERSATION_STATES.SPEAKING
    );

    try {
      await speak(
        text,
        {
          language: "fr-FR",
          volume: 1,

          onStart: () => {
            if (
              interruptingRef.current
            ) {
              return;
            }

            setSpeaking(true);

            setSystemState(
              (previous) => ({
                ...previous,
                ai: "speaking",
                voice: "speaking",
              })
            );
          },

          onEnd: () => {
            if (
              interruptingRef.current
            ) {
              return;
            }

            setSpeaking(false);

            setSystemState(
              (previous) => ({
                ...previous,
                ai: "online",
                voice: "online",
              })
            );
          },

          onError: (
            error
          ) => {
            if (
              interruptingRef.current
            ) {
              return;
            }

            console.warn(
              "Erreur VoiceEngine :",
              error
            );

            setSpeaking(false);

            setSystemState(
              (previous) => ({
                ...previous,
                ai: "online",
                voice: "error",
              })
            );
          },
        }
      );
    } catch (error) {
      if (
        interruptingRef.current
      ) {
        return;
      }

      console.error(
        "Erreur synthèse vocale :",
        error
      );

      setSpeaking(false);

      setSystemState(
        (previous) => ({
          ...previous,
          ai: "online",
          voice: "error",
        })
      );
    }
  }

  /*
   * =====================================================
   * DÉTECTION VISION
   * =====================================================
   */

  function isVisionRequest(
    message
  ) {
    const normalized =
      message
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );

    const patterns = [
      "regarde la scene",
      "regarde",
      "observe la scene",
      "observe",
      "qu est ce que tu vois",
      "quest ce que tu vois",
      "qu'est ce que tu vois",
      "que vois tu",
      "que vois-tu",
      "tu vois quoi",
      "analyse la scene",
      "analyse cette scene",
      "analyse ce que tu vois",
      "decris la scene",
      "decris ce que tu vois",
      "montre moi ce que tu vois",
    ];

    return patterns.some(
      (pattern) =>
        normalized.includes(
          pattern
        )
    );
  }

  /*
   * =====================================================
   * VISION
   * =====================================================
   */

  async function processVisionRequest(plan = null) {
  const visionRequest =
    plan?.message?.trim() ||
    "Regarde attentivement cette scène.";

  const visionPrompt = `
${visionRequest}

Réponds comme Lyssia dans une conversation orale naturelle.

RÈGLES DE RÉPONSE :
- Réponds en français.
- Sois très concise.
- Pour une demande générale d'observation, réponds en UNE ou DEUX phrases maximum.
- Maximum 300 caractères environ.
- Donne seulement les éléments visuellement importants.
- Ne fais pas de liste.
- Ne donne pas de suggestions ou de conseils sauf si l'utilisateur les demande explicitement.
- Ne commence pas par « Merci — voici ce que j'observe ». 
- Ne répète pas la demande de l'utilisateur.
- Ne prétends jamais voir un élément qui n'est pas clairement visible.
`;
    if (!visionController) {
      throw new Error(
        "Le moteur de vision de Lyssia n'est pas disponible."
      );
    }

    interruptingRef.current =
      false;

    stopSpeaking();

    setSpeaking(false);

    setLoading(true);

    setSystemState(
      (previous) => ({
        ...previous,
        ai: "thinking",
        vision: "thinking",
      })
    );

    setMessages(
      (previous) => [
        ...previous,
        {
          sender:
            "lyssia",
          text:
            "D'accord. Je regarde la scène...",
        },
      ]
    );

    try {
      const response =
        await visionController.captureAndAnalyze(
          {
            prompt:
  visionPrompt,

            speak: false,
          }
        );

      if (
        !response ||
        !response.trim()
      ) {
        throw new Error(
          "La vision n'a retourné aucune réponse."
        );
      }

      setMessages(
        (previous) => [
          ...previous,
          {
            sender:
              "lyssia",
            text:
              response,
          },
        ]
      );

      setLoading(false);

      setSystemState(
        (previous) => ({
          ...previous,
          ai: "speaking",
          vision: "online",
        })
      );

      await speakResponse(
        response
      );

      return response;
    } catch (error) {
      console.error(
        "Erreur Vision :",
        error
      );

      setLoading(false);
      setSpeaking(false);

      setMessages(
        (previous) => [
          ...previous,
          {
            sender:
              "lyssia",
            text:
              "Je rencontre un problème pour analyser la scène.",
          },
        ]
      );

      setSystemState(
        (previous) => ({
          ...previous,
          ai: "online",
          vision: "error",
        })
      );

      throw error;
    }
  }

  /*
   * =====================================================
   * MÉMORISATION D'UNE CONVERSATION
   * =====================================================
   */

  function rememberConversation(
    userMessage,
    assistantResponse
  ) {
    /*
     * Les messages de vision sont déjà mémorisés
     * par CameraView.
     *
     * On évite donc de créer un doublon.
     */


    /*
     * On mémorise uniquement un échange suffisamment
     * significatif.
     */

    if (
      !userMessage?.trim() ||
      !assistantResponse?.trim()
    ) {
      return;
    }

    /*
     * Évite d'enregistrer les messages très courts
     * du genre "ok", "oui", "merci".
     */

    if (
      userMessage.trim().length <
      4
    ) {
      return;
    }

    try {
      addConversationMemory(
        `Utilisateur : ${userMessage.trim()}\nLyssia : ${assistantResponse.trim()}`,
        {
          timestamp:
            new Date().toISOString(),
        }
      );
    } catch (error) {
      console.warn(
        "Impossible de mémoriser la conversation :",
        error
      );
    }
  }

  /*
   * =====================================================
   * MESSAGE
   * =====================================================
   */

  async function processMessage(
    messageText
  ) {
    if (
      !messageText?.trim() ||
      loading
    ) {
      return;
    }

    const userMessage =
      messageText.trim();

    const cognition =
      analyzeMessage(
      userMessage,
      memories
    );

    const cognitiveContext =
      prepareCognitiveContext({
      message: userMessage,
      cognition,
      memories,
    });

    console.log(
  "🧠 Lyssia — analyse cognitive :",
  {
    intent: cognition.intent,
    needsMemory:
      cognition.needsMemory,
    needsVision:
      cognition.needsVision,
    priority:
      cognition.priority,
    relevantMemories:
      cognition.relevantMemories,
  }
);

    const cognitivePlan =
      orchestrateCognition({
        message: userMessage,
        memories,
      });

    console.log("🧠 LYSSIA — PLAN COGNITIF V2",{intent:cognitivePlan.intent,priority:cognitivePlan.priority,needsMemory:cognitivePlan.needsMemory,needsVision:cognitivePlan.needsVision,route:cognitivePlan.route,action:cognitivePlan.action,memories:cognitivePlan.memories,});

    interruptingRef.current =
      false;

    setMessages(
      (previous) => [
        ...previous,
        {
          sender: "user",
          text:
            userMessage,
        },
      ]
    );

    setInput("");

    /*
     * -----------------------------------------------------
     * STOP
     * -----------------------------------------------------
     * Detection normalisee (accents, limites de mot) via
     * CognitiveEngine V2 - couvre "arrete", "stop", "coupe",
     * "desactive", etc. Aucun mecanisme equivalent n'existait
     * pour le texte tape avant cet ajout (seul le bouton Stop
     * de l'interface declenchait cet arret).
     */

    if (cognitivePlan.action === "stop") {
      await executeCognitivePlan(
        cognitivePlan,
        {
          onStop: () => {
            stopSpeaking();
            setSpeaking(false);
          },
        }
      );

      return;
    }

    /*
     * -----------------------------------------------------
     * VISION
     * -----------------------------------------------------
     */

    if (
      cognitivePlan.route === "vision" &&
      cognitivePlan.action === "observe"
    ) {
      await executeCognitivePlan(
        cognitivePlan,
        {
          onVision: async (plan) => {
            try {
              await processVisionRequest(plan);
            } catch {
              // L'erreur est déjà affichée.
            }
          },
        }
      );

      return;
    }

    /*
     * -----------------------------------------------------
     * CHAT NORMAL
     * -----------------------------------------------------
     */

    setLoading(true);

    stopSpeaking();

    setSpeaking(false);

    setSystemState(
      (previous) => ({
        ...previous,
        ai: "thinking",
      })
    );

    try {
      /*
       * ---------------------------------------------------
       * CONSTRUCTION DU CONTEXTE MÉMOIRE
       * ---------------------------------------------------
       */

      const memoryContext =
        buildMemoryContext(
          userMessage
        );

      /*
       * On garde le message utilisateur original.
       *
       * Le contexte mémoire est ajouté après celui-ci
       * afin que le backend sache qu'il s'agit de
       * souvenirs locaux et non d'une nouvelle demande.
       */

      const enrichedMessage =
        memoryContext
          ? `${userMessage}\n\n${memoryContext}`
          : userMessage;

      const response =
        await askLyssia(
        enrichedMessage,
        cognitiveContext
      );

      if (
        !response ||
        !response.trim()
      ) {
        throw new Error(
          "Réponse vide de Lyssia."
        );
      }

      setMessages(
        (previous) => [
          ...previous,
          {
            sender:
              "lyssia",
            text:
              response,
          },
        ]
      );

      setLoading(false);

      /*
       * ---------------------------------------------------
       * MÉMOIRE CONVERSATIONNELLE
       * ---------------------------------------------------
       */

      rememberConversation(
        userMessage,
        response
      );

      await speakResponse(
        response
      );
    } catch (error) {
      console.error(
        "Erreur Lyssia :",
        error
      );

      setLoading(false);
      setSpeaking(false);

      setMessages(
        (previous) => [
          ...previous,
          {
            sender:
              "lyssia",
            text:
              "Je rencontre un problème pour répondre.",
          },
        ]
      );

      setSystemState(
        (previous) => ({
          ...previous,
          ai: "online",
        })
      );
    }
  }

  /*
   * =====================================================
   * ENVOI
   * =====================================================
   */

  async function sendMessage() {
    if (
      !input.trim() ||
      loading ||
      listening
    ) {
      return;
    }

    await processMessage(
      input
    );
  }

  /*
   * =====================================================
   * ARRÊT MICRO
   * =====================================================
   */

  function stopVoiceListening() {
  if (speechPauseTimerRef.current) {
    clearTimeout(
      speechPauseTimerRef.current
    );

    speechPauseTimerRef.current =
      null;
  }

  if (
    listeningSessionRef.current
  ) {
      try {
        listeningSessionRef.current.stop();
      } catch (error) {
        console.warn(
          "Impossible d'arrêter l'écoute :",
          error
        );
      }
    }

    listeningSessionRef.current =
      null;

    setListening(false);

    setSystemState(
      (previous) => ({
        ...previous,
        ai: "online",
        voice: "online",
      })
    );
  }

  /*
   * =====================================================
   * DÉMARRAGE MICRO
   * =====================================================
   */

  function startVoiceListening() {
    console.log(
  "🎤 Lyssia — startVoiceListening() déclenché"
);
    if (listening) {
      return;
    }

    if (
      loading &&
      !speaking
    ) {
      return;
    }

    if (
      !isListeningSupported()
    ) {
      setMessages(
        (previous) => [
          ...previous,
          {
            sender:
              "lyssia",
            text:
              "La reconnaissance vocale n'est pas disponible dans ce navigateur.",
          },
        ]
      );

      return;
    }

    /*
     * Le micro peut interrompre Lyssia.
     */

    if (speaking) {
      interruptingRef.current =
        true;

      stopSpeaking();

      setSpeaking(false);
    }

    stopSpeaking();

    setInput("");

    setListening(true);

    setSystemState(
      (previous) => ({
        ...previous,
        ai: "listening",
        voice: "listening",
      })
    );

    updateConversationState(
      CONVERSATION_STATES.LISTENING
    );

    try {
      const session =
        createListeningSession(
          {
            language:
              "fr-FR",

            continuous:
              true,

            interimResults:
              true,

            onStart:
              () => {
                setListening(
                  true
                );

                setSystemState(
                  (previous) => ({
                    ...previous,
                    ai: "listening",
                    voice: "listening",
                  })
                );
              },

            onInterimResult:
              (
                text
              ) => {
                setInput(
                  text
                );
              },

            onFinalResult:
              (
                text
              ) => {
                setInput(
                  text
                );
              },

            /*
             * Signal d'activité brut (interim + final).
             * Sert uniquement a l'interruption : si Lyssia
             * parle et qu'une activite vocale reelle est
             * captee, on la coupe immediatement, sans
             * attendre la fin de l'enonce ni un clic.
             */
            onSpeechActivity:
              (
                text
              ) => {
                if (
                  speaking &&
                  text?.trim().length > 1
                ) {
                  interruptingRef.current =
                    true;

                  stopSpeaking();

                  setSpeaking(false);

                  setSystemState(
                    (previous) => ({
                      ...previous,
                      ai: "listening",
                      voice: "listening",
                    })
                  );
                }
              },

            onEnd:
  async ({
    text,
  }) => {
    if (speechPauseTimerRef.current) {
      clearTimeout(
        speechPauseTimerRef.current
      );

      speechPauseTimerRef.current =
        null;
    }

    listeningSessionRef.current =
      null;

                setListening(
                  false
                );

                if (
                  !text?.trim()
                ) {
                  setInput(
                    ""
                  );

                  setSystemState(
                    (previous) => ({
                      ...previous,
                      ai: "online",
                      voice: "online",
                    })
                  );

                  /*
                   * Ecoute continue : on relance meme
                   * si aucun texte n'a ete capte.
                   */
                  setTimeout(
                    () => {
                      startVoiceListening();
                    },
                    300
                  );

                  return;
                }

                updateConversationState(
                    CONVERSATION_STATES.THINKING
                );

                updateConversationState(
                    CONVERSATION_STATES.IDLE
                );

                await processMessage(
                  text
                );

                /*
                 * Ecoute continue : on relance apres
                 * traitement, une fois la reponse geree
                 * (parlee ou non) par processMessage.
                 */
                setTimeout(
                  () => {
                    startVoiceListening();
                  },
                  300
                );
              },

            onError:
              (
                error
              ) => {
                console.warn(
                  "Erreur reconnaissance vocale :",
                  error
                );

                /*
                 * Ecoute continue : on relance aussi
                 * apres une erreur, avec un delai un peu
                 * plus long pour eviter une boucle serree
                 * si le probleme persiste.
                 */
                setTimeout(
                  () => {
                    startVoiceListening();
                  },
                  1000
                );

                listeningSessionRef.current =
                  null;

                setListening(
                  false
                );

                setSystemState(
                  (previous) => ({
                    ...previous,
                    ai: "online",
                    voice: "error",
                  })
                );
              },
          }
        );

      listeningSessionRef.current =
        session;

      session.start();
    } catch (error) {
      console.error(
        "Impossible de démarrer le microphone :",
        error
      );

      listeningSessionRef.current =
        null;

      setListening(
        false
      );

      setSystemState(
        (previous) => ({
          ...previous,
          ai: "online",
          voice: "error",
        })
      );
    }
  }

  /*
   * =====================================================
   * INTERFACE
   * =====================================================
   */

  return (
    <Paper
      sx={{
        height: "100%",

        display:
          "flex",

        flexDirection:
          "column",

        background:
          "#101827",

        color: "white",

        borderRadius: 4,

        overflow:
          "hidden",
      }}
    >
      {/* =================================================
          TITRE + MESSAGES (masques en mode compact)
         ================================================= */}

      {!compact && (
      <>

      <Typography
        variant="h6"
        sx={{
          p: 2,

          borderBottom:
            "1px solid #24354d",
        }}
      >
        💬 Conversation avec Lyssia
      </Typography>

      {/* =================================================
          MESSAGES
         ================================================= */}

      <Box
        sx={{
          flex: 1,

          overflowY:
            "auto",

          p: 2,
        }}
      >
        {messages.map(
          (
            message,
            index
          ) => (
            <Box
              key={
                index
              }
              sx={{
                mb: 2,

                display:
                  "flex",

                justifyContent:
                  message.sender ===
                  "user"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              <Box
                sx={{
                  background:
                    message.sender ===
                    "user"
                      ? "#2563eb"
                      : "#1f2937",

                  px: 2,

                  py: 1.5,

                  borderRadius:
                    3,

                  maxWidth:
                    "80%",

                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {
                  message.text
                }
              </Box>
            </Box>
          )
        )}

        {listening && (
          <Typography
            sx={{
              color:
                "#ffd166",

              fontStyle:
                "italic",

              mb: 1,
            }}
          >
            Lyssia vous écoute...
          </Typography>
        )}

        {loading &&
          !listening &&
          !speaking && (
            <Typography
              sx={{
                color:
                  "#b77cff",

                fontStyle:
                  "italic",

                mb: 1,
              }}
            >
              Lyssia réfléchit...
            </Typography>
          )}

        {speaking &&
          !listening && (
            <Typography
              sx={{
                color:
                  "#59d9ff",

                fontStyle:
                  "italic",

                mb: 1,
              }}
            >
              Lyssia parle...
            </Typography>
          )}
      </Box>

      </>
      )}

      {/* =================================================
          SAISIE
         ================================================= */}

      <Box
        sx={{
          display:
            "flex",

          gap: 1,

          p: 2,

          borderTop:
            "1px solid #24354d",
        }}
      >
        <TextField
          fullWidth
          value={input}
          placeholder={
            listening
              ? "Lyssia vous écoute..."
              : speaking
                ? "Lyssia parle..."
                : "Écris un message..."
          }
          onChange={(
            event
          ) =>
            setInput(
              event.target.value
            )
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
                "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();

              sendMessage();
            }
          }}
          disabled={
            listening
          }
          sx={{
            input: {
              color:
                "white",
            },

            fieldset: {
              borderColor:
                "#42526b",
            },
          }}
        />

        {/* =================================================
            MICRO
           ================================================= */}

        <Tooltip
          title={
            speaking
              ? "Interrompre Lyssia et parler"
              : listening
                ? "Arrêter l'écoute"
                : "Parler à Lyssia"
          }
        >
          <span>
            <IconButton
              onClick={
                listening
                  ? stopVoiceListening
                  : startVoiceListening
              }
              disabled={
                loading &&
                !speaking
              }
              sx={{
                color:
                  speaking
                    ? "#59d9ff"
                    : listening
                      ? "#ff647c"
                      : "#ffd166",
              }}
            >
              {listening ? (
                <StopIcon />
              ) : (
                <MicIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>

        {/* =================================================
            ENVOYER
           ================================================= */}

        <IconButton
          color="primary"
          onClick={
            sendMessage
          }
          disabled={
            loading ||
            listening ||
            speaking ||
            !input.trim()
          }
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}









