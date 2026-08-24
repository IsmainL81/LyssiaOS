import {
  useRef,
  useState,
} from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";

import { askLyssia } from "./AIEngine";

import {
  useLyssia,
} from "../../core/LyssiaCore";

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
  performVisionRequest,
} from "../vision/visionRequest";

/*
 * 20 Mo bruts -> ~27 Mo en base64, sous la limite
 * OpenAI de 32 Mo combinés par requête.
 */
const MAX_ATTACHMENT_BYTES =
  20 * 1024 * 1024;

/**
 * =====================================================
 * CHAT PANEL
 * =====================================================
 * Chat texte pur -- aucune entree/sortie vocale ici.
 * L'ecoute et la parole vivent desormais dans leur propre
 * systeme (pages/Conversation.jsx). Ce panneau et ce
 * systeme partagent le meme coeur cognitif
 * (analyzeMessage / orchestrateCognition /
 * executeCognitivePlan) et le meme point d'entree memoire
 * (rememberExchange), mais aucun n'a de dependance sur
 * l'autre.
 */

export default function ChatPanel({
  compact = false,
}) {
  const {
  setSystemState,
  memories,
  searchMemories,
  rememberExchange,
} = useLyssia();

  const {
    visionController,
  } = useVision();

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
    attachment,
    setAttachment,
  ] = useState(null);

  const fileInputRef =
    useRef(null);

  /*
   * =====================================================
   * PIÈCE JOINTE
   * =====================================================
   */

  function handleFileSelect(
    event
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      file.size >
      MAX_ATTACHMENT_BYTES
    ) {
      setMessages(
        (previous) => [
          ...previous,
          {
            sender:
              "lyssia",
            text:
              "Ce fichier dépasse 20 Mo, je ne peux pas le joindre.",
          },
        ]
      );

      return;
    }

    const isImage =
      file.type.startsWith(
        "image/"
      );

    const isPdf =
      file.type ===
      "application/pdf";

    if (
      !isImage &&
      !isPdf
    ) {
      setMessages(
        (previous) => [
          ...previous,
          {
            sender:
              "lyssia",
            text:
              "Je ne peux joindre que des images ou des PDF pour l'instant.",
          },
        ]
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setAttachment({
        data:
          reader.result,

        filename:
          file.name,

        isImage,
      });
    };

    reader.onerror = () => {
      console.warn(
        "Impossible de lire le fichier :",
        reader.error
      );
    };

    reader.readAsDataURL(
      file
    );
  }

  function clearAttachment() {
    setAttachment(null);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
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
        await performVisionRequest(
          visionController,
          plan?.message
        );

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
          ai: "online",
          vision: "online",
        })
      );

      return response;
    } catch (error) {
      console.error(
        "Erreur Vision :",
        error
      );

      setLoading(false);

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
     * Point d'entrée unique vers la mémoire (LyssiaCore) --
     * partagé avec Conversation.jsx (mode vocal). Garde les
     * guards et déclenche l'extraction sémantique en tâche
     * de fond.
     */

    rememberExchange(
      userMessage,
      assistantResponse
    );
  }

  /*
   * =====================================================
   * MESSAGE
   * =====================================================
   */

  async function processMessage(
    messageText,
    attachmentToSend = null
  ) {
    if (
      (!messageText?.trim() &&
        !attachmentToSend) ||
      loading
    ) {
      return;
    }

    const userMessage =
      messageText?.trim() ||
      (attachmentToSend?.isImage
        ? "Voici une image."
        : "Voici un document.");

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

    setMessages(
      (previous) => [
        ...previous,
        {
          sender: "user",
          text:
            userMessage,
          attachment:
            attachmentToSend,
        },
      ]
    );

    setInput("");

    /*
     * -----------------------------------------------------
     * VISION (caméra live)
     * -----------------------------------------------------
     * Une pièce jointe court-circuite cette route : elle
     * n'a rien à voir avec la capture caméra, c'est déjà
     * une image à analyser telle quelle.
     */

    if (
      !attachmentToSend &&
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
        cognitiveContext,
        attachmentToSend
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

      setSystemState(
        (previous) => ({
          ...previous,
          ai: "online",
        })
      );

      /*
       * ---------------------------------------------------
       * MÉMOIRE CONVERSATIONNELLE
       * ---------------------------------------------------
       */

      rememberConversation(
        userMessage,
        response
      );
    } catch (error) {
      console.error(
        "Erreur Lyssia :",
        error
      );

      setLoading(false);

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
      (!input.trim() &&
        !attachment) ||
      loading
    ) {
      return;
    }

    const attachmentToSend =
      attachment;

    setAttachment(null);

    await processMessage(
      input,
      attachmentToSend
    );
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
                {message.attachment && (
                  message.attachment.isImage ? (
                    <Box
                      component="img"
                      src={
                        message.attachment.data
                      }
                      alt={
                        message.attachment.filename ||
                        "Pièce jointe"
                      }
                      sx={{
                        maxWidth: "100%",
                        maxHeight: 220,
                        borderRadius: 2,
                        display: "block",
                        mb:
                          message.text
                            ? 1
                            : 0,
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<DescriptionIcon />}
                      label={
                        message.attachment.filename ||
                        "Document"
                      }
                      size="small"
                      sx={{
                        mb:
                          message.text
                            ? 1
                            : 0,
                        bgcolor:
                          "rgba(255,255,255,0.1)",
                        color: "white",
                      }}
                    />
                  )
                )}

                {
                  message.text
                }
              </Box>
            </Box>
          )
        )}

        {loading && (
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
      </Box>

      </>
      )}

      {/* =================================================
          PIÈCE JOINTE EN ATTENTE
         ================================================= */}

      {attachment && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            pt: 2,
          }}
        >
          <Chip
            icon={
              attachment.isImage ? (
                <Box
                  component="img"
                  src={attachment.data}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <DescriptionIcon />
              )
            }
            label={attachment.filename}
            onDelete={clearAttachment}
            deleteIcon={<CloseIcon />}
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              color: "white",
              maxWidth: "100%",
            }}
          />
        </Box>
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <Tooltip title="Joindre une image ou un PDF">
          <IconButton
            onClick={openFilePicker}
            sx={{ color: "#9aa8bd" }}
          >
            <AttachFileIcon />
          </IconButton>
        </Tooltip>

        <TextField
          fullWidth
          value={input}
          placeholder="Écris un message..."
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
            ENVOYER
           ================================================= */}

        <IconButton
          color="primary"
          onClick={
            sendMessage
          }
          disabled={
            loading ||
            (!input.trim() &&
              !attachment)
          }
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
