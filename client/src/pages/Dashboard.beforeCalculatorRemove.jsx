import {
  Box,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

import {
  Fullscreen,
  Tune,
  ImageSearch,
  TrackChanges,
  FormatListBulleted,
  QueryStats,
  Mic,
  Send,
  Psychology,
} from "@mui/icons-material";

import LivingPortrait from "../features/avatar/LivingPortrait";
import ChatPanel from "../features/ai/ChatPanel";
import CameraView from "../components/CameraView";
import MemoryPanel from "../components/MemoryPanel";
import ContextPanel from "../components/ContextPanel";
import { useLyssia } from "../core/LyssiaCore";
import InteractionsPanel from "../components/InteractionsPanel";
import QuickToolsPanel from "../components/QuickToolsPanel";
import SystemStatusPanel from "../components/SystemStatusPanel";
import CalculatorDialog from "../components/CalculatorDialog";
import { useState } from "react";


export default function Dashboard() {
  const {
    systemState,
    memories,
  } = useLyssia();

  const [
  calculatorOpen,
  setCalculatorOpen,
] = useState(false);

  const conversationMemories =
  memories.filter(
    (memory) =>
      memory.type === "conversation"
  );

const visionMemories =
  memories.filter(
    (memory) =>
      memory.type === "vision"
  );

const latestMemory =
  memories.length > 0
    ? memories[0]
    : null;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        boxSizing: "border-box",

        display: "grid",

        gridTemplateColumns: {
          xs: "1fr",
          lg: "minmax(0, 1fr) 285px",
},

        overflow: "hidden",

        background:
          "radial-gradient(circle at 50% 30%, #17243a 0%, #080e19 48%, #03060b 100%)",

        color: "#f8fafc",
      }}
    >
      {/* =====================================================
          ZONE CENTRALE
      ===================================================== */}

      <Box
        sx={{
          position: "relative",
          minWidth: 0,
          height: "100vh",

          overflow: "hidden",

          borderRight: {
            lg: "1px solid rgba(148,163,184,0.10)",
          },
        }}
      >
        {/* ===================================================
            STATUT + COMMANDES
        =================================================== */}

        <Box
          sx={{
            position: "absolute",

            top: 20,
            left: 18,
            right: 18,

            zIndex: 20,

            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Chip
            label="En ligne"
            size="small"
            sx={{
              height: 42,

              px: 1,

              borderRadius: 4,

              color: "#e2e8f0",

              background:
                "rgba(8,15,27,0.76)",

              border:
                "1px solid rgba(148,163,184,0.12)",

              backdropFilter: "blur(14px)",

              fontSize: 13,

              fontWeight: 600,

              "&::before": {
                content: '""',

                width: 8,
                height: 8,

                marginRight: 9,

                borderRadius: "50%",

                background: "#22c55e",

                boxShadow:
                  "0 0 12px rgba(34,197,94,0.9)",
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            <IconButton sx={glassButton}>
              <Fullscreen />
            </IconButton>

            <IconButton sx={glassButton}>
              <Tune />
            </IconButton>
          </Box>
        </Box>


        {/* ===================================================
            HALO / ATMOSPHÈRE
        =================================================== */}

        <Box
          sx={{
            position: "absolute",

            width: {
              xs: "100%",
              md: "75%",
            },

            height: "75%",

            top: "4%",
            left: "50%",

            transform: "translateX(-50%)",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(68,91,133,0.30) 0%, rgba(40,57,88,0.12) 40%, transparent 72%)",

            filter: "blur(50px)",

            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "absolute",

            width: 480,
            height: 480,

            top: "20%",
            left: "50%",

            transform: "translateX(-50%)",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 68%)",

            filter: "blur(30px)",

            pointerEvents: "none",
          }}
        />


        {/* ===================================================
            AVATAR
        =================================================== */}

        <Box
          sx={{
            position: "absolute",

            top: 50,
            left: 25,
            right: 25,

            bottom: 250,

            zIndex: 3,

            display: "flex",

            alignItems: "center",
            justifyContent: "center",

            overflow: "hidden",

            "& > *": {
              width: "100%",
              height: "100%",
            },
          }}
        >
          <LivingPortrait />
        </Box>


        {/* ===================================================
            PRÉSENCE LYSSIA
        =================================================== */}

        <Box
          sx={{
            position: "absolute",

            left: 24,
            right: 24,

            bottom: 198,

            zIndex: 10,

            display: "flex",
            flexDirection: "column",

            alignItems: "center",

            pointerEvents: "none",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: 26,
                md: 32,
              },

              fontWeight: 400,

              letterSpacing: -0.8,

              color: "#f8fafc",

              textAlign: "center",

              textShadow:
                "0 4px 25px rgba(0,0,0,0.85)",
            }}
          >
            Bonjour Ismain 👋
          </Typography>

          <Typography
            sx={{
              mt: 0.6,

              fontSize: 14,

              color: "#cbd5e1",

              textAlign: "center",

              textShadow:
                "0 2px 15px rgba(0,0,0,0.9)",
            }}
          >
            Je suis Lyssia, comment puis-je
            vous aider aujourd'hui ?
          </Typography>
        </Box>


        {/* ===================================================
            ACTIONS RAPIDES
        =================================================== */}

        <Box
          sx={{
            position: "absolute",

            left: 18,
            right: 18,

            bottom: 135,

            zIndex: 12,

            display: "flex",

            flexWrap: "wrap",

            justifyContent: "center",

            gap: 1,
          }}
        >
          <QuickAction
            icon={<ImageSearch />}
            text="Analyse cette image"
          />

          <QuickAction
            icon={<TrackChanges />}
            text="Mes objectifs"
          />

          <QuickAction
            icon={<FormatListBulleted />}
            text="Mes tâches"
          />

          <QuickAction
            icon={<QueryStats />}
            text="Recherche IA"
          />
        </Box>


        {/* ===================================================
            BARRE DE CONVERSATION
        =================================================== */}

        <Box
          sx={{
            position: "absolute",

            left: 18,
            right: 18,

            bottom: 48,

            zIndex: 15,

            display: "flex",

            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 720,

              height: 68,

              display: "flex",
              alignItems: "center",

              px: 1.5,

              borderRadius: 4,

              background:
                "rgba(7,13,24,0.94)",

              border:
                "1px solid rgba(148,163,184,0.13)",

              boxShadow:
                "0 15px 45px rgba(0,0,0,0.45)",

              backdropFilter: "blur(18px)",
            }}
          >
            <IconButton
              sx={{
                width: 46,
                height: 46,

                mr: 1,

                color: "#b77cff",

                background:
                  "rgba(139,92,246,0.10)",

                "&:hover": {
                  background:
                    "rgba(139,92,246,0.18)",
                },
              }}
            >
              <Mic />
            </IconButton>

            <Typography
              sx={{
                flex: 1,

                color: "#64748b",

                fontSize: 14,
              }}
            >
              Parlez ou écrivez votre message...
            </Typography>

            <IconButton
              sx={{
                width: 48,
                height: 48,

                borderRadius: 3,

                color: "white",

                background:
                  "linear-gradient(135deg, #8b5cf6, #5b21b6)",

                boxShadow:
                  "0 0 22px rgba(139,92,246,0.30)",

                "&:hover": {
                  background:
                    "linear-gradient(135deg, #9f67ff, #6d28d9)",
                },
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>


        {/* ===================================================
            VISUALISATION AUDIO
        =================================================== */}

        <Box
          sx={{
            position: "absolute",

            bottom: 20,

            left: 0,
            right: 0,

            zIndex: 10,
          }}
        >
          <AudioWave />
        </Box>


        {/* ===================================================
            CHATPANEL RÉEL
        =================================================== */}

        <Box
          sx={{
          position: "absolute",

          left: 18,
          right: 18,
          bottom: 18,

          height: 300,

          zIndex: 20,

          minHeight: 0,
        }}
        >
          <ChatPanel />
        </Box>
      </Box>


      {/* =====================================================
          PANNEAU DROIT
      ===================================================== */}

      <Box
        sx={{
          height: "100vh",

          overflowY: "auto",

          p: 2,

          boxSizing: "border-box",

          background:
            "rgba(3,7,13,0.92)",

          display: {
            xs: "none",
            lg: "block",
          },
        }}
      >
        {/* ===================================================
            MÉMOIRE
        =================================================== */}

        <Panel
          title="MÉMOIRE ACTIVE"
          link="Voir tout"
      >
        <MemoryPanel
          memories={memories}
      />

        </Panel>

        <Panel
          title="CONTEXTE ACTUEL"
          sx={{
          mt: 2,
        }}
>
        <ContextPanel
          systemState={systemState}
      />
        </Panel>

        {/* ===================================================
            CONTEXTE
        =================================================== */}

          <Panel
            title="ÉTAT DU SYSTÈME"
            sx={{
            mt: 2,
            }}
          >
          <SystemStatusPanel
            systemState={systemState}
            memories={memories}
          />
          </Panel>

        {/* ===================================================
            INTERACTIONS
        =================================================== */}

        <Panel
          title="DERNIÈRES INTERACTIONS"
          link="Voir tout"
          sx={{
          mt: 2,
        }}
        >
        <InteractionsPanel
          memories={memories}
          formatMemoryTime={formatMemoryTime}
        />
        </Panel>

        {/* ===================================================
            OUTILS
        =================================================== */}

        <Panel
          title="OUTILS RAPIDES"
          sx={{
          mt: 2,
        }}
        >
        <QuickToolsPanel
          onCalculator={() =>
          setCalculatorOpen(true)
        }
      />
        </Panel>
        </Box>

            <CalculatorDialog
              open={calculatorOpen}
              onClose={() =>
              setCalculatorOpen(false)
            }
        />

      {/* =====================================================
          VISION ENGINE
      ===================================================== */}

      <Box
        sx={{
          position: "fixed",

          width: 1,
          height: 1,

          left: -10000,
          top: -10000,

          overflow: "hidden",

          opacity: 0,

          pointerEvents: "none",

          zIndex: -1,
        }}
      >
        <CameraView />
      </Box>
    </Box>
  );
}


/* ============================================================
   BOUTON VERRE
============================================================ */

const glassButton = {
  width: 46,
  height: 46,

  color: "#e2e8f0",

  background:
    "rgba(15,23,42,0.72)",

  border:
    "1px solid rgba(148,163,184,0.10)",

  backdropFilter:
    "blur(12px)",

  "&:hover": {
    background:
      "rgba(30,41,59,0.90)",
  },
};


/* ============================================================
   ACTION RAPIDE
============================================================ */

function QuickAction({
  icon,
  text,
}) {
  return (
    <Box
      sx={{
        display: "flex",

        alignItems: "center",

        gap: 0.8,

        px: 1.5,
        py: 0.9,

        borderRadius: 3,

        color: "#e2e8f0",

        background:
          "rgba(10,17,29,0.80)",

        border:
          "1px solid rgba(148,163,184,0.10)",

        backdropFilter: "blur(12px)",

        cursor: "pointer",

        transition: "all 180ms ease",

        "&:hover": {
          background:
            "rgba(88,65,160,0.25)",

          borderColor:
            "rgba(139,92,246,0.30)",

          transform:
            "translateY(-1px)",
        },

        "& svg": {
          fontSize: 17,

          color: "#b77cff",
        },
      }}
    >
      {icon}

      <Typography
        sx={{
          fontSize: 11,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}


/* ============================================================
   PANNEAU
============================================================ */

function Panel({
  title,
  link,
  children,
  sx = {},
}) {
  return (
    <Box
      sx={{
        p: 2,

        borderRadius: 3,

        background:
          "linear-gradient(180deg, rgba(12,21,34,0.96), rgba(7,13,23,0.96))",

        border:
          "1px solid rgba(148,163,184,0.10)",

        boxShadow:
          "0 10px 30px rgba(0,0,0,0.18)",

        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          justifyContent: "space-between",

          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,

            fontWeight: 700,

            letterSpacing: 0.4,

            color: "#f1f5f9",
          }}
        >
          {title}
        </Typography>

        {link && (
          <Typography
            sx={{
              fontSize: 11,

              color: "#93c5fd",

              cursor: "pointer",
            }}
          >
            {link}
          </Typography>
        )}
      </Box>

      {children}
    </Box>
  );
}


/* ============================================================
   PROGRESSION
============================================================ */

function ProgressItem({
  title,
  subtitle,
  value,
}) {
  return (
    <Box
      sx={{
        mb: 2.2,

        "&:last-child": {
          mb: 0,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",

          justifyContent:
            "space-between",

          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 13,

            color: "#f1f5f9",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 11,

            color: "#cbd5e1",
          }}
        >
          {value}%
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: 0.3,
          mb: 0.8,

          fontSize: 10,

          color: "#64748b",
        }}
      >
        {subtitle}
      </Typography>

      <Box
        sx={{
          height: 5,

          borderRadius: 10,

          background:
            "rgba(71,85,105,0.25)",

          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${value}%`,

            height: "100%",

            borderRadius: 10,

            background:
              "linear-gradient(90deg, #8b5cf6, #6d4aff)",

            boxShadow:
              "0 0 10px rgba(139,92,246,0.25)",
          }}
        />
      </Box>
    </Box>
  );
}


/* ============================================================
   CONTEXTE
============================================================ */

function ContextLine({
  icon,
  text,
}) {
  return (
    <Box
      sx={{
        display: "flex",

        alignItems: "center",

        gap: 1.2,

        mb: 1.25,

        "&:last-child": {
          mb: 0,
        },
      }}
    >
      <Typography
        sx={{
          width: 20,

          fontSize: 15,

          textAlign: "center",
        }}
      >
        {icon}
      </Typography>

      <Typography
        sx={{
          fontSize: 12,

          color: "#cbd5e1",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}


/* ============================================================
   INTERACTION
============================================================ */

function Interaction({
  icon,
  text,
  time,
}) {
  return (
    <Box
      sx={{
        display: "flex",

        alignItems: "center",

        gap: 1.2,

        py: 0.9,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,

          display: "flex",

          alignItems: "center",
          justifyContent: "center",

          borderRadius: 1.5,

          background:
            "rgba(139,92,246,0.10)",

          color: "#b77cff",

          "& svg": {
            fontSize: 16,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          flex: 1,

          fontSize: 12,

          color: "#d1d5db",
        }}
      >
        {text}
      </Typography>

      <Typography
        sx={{
          fontSize: 10,

          color: "#64748b",
        }}
      >
        {time}
      </Typography>
    </Box>
  );
}


/* ============================================================
   OUTIL
============================================================ */


  function Tool({
  icon,
  label,
  onClick,
}) {

  return (
    <Box
      onClick={onClick}
      sx={{
        minHeight: 72,

        display: "flex",

        flexDirection: "column",

        alignItems: "center",
        justifyContent: "center",

        gap: 0.7,

        borderRadius: 2,

        background:
          "rgba(30,41,59,0.45)",

        border:
          "1px solid rgba(148,163,184,0.07)",

        cursor: "pointer",

        transition:
          "all 180ms ease",

        "&:hover": {
          background:
            "rgba(88,65,160,0.18)",

          borderColor:
            "rgba(139,92,246,0.25)",
        },

        "& svg": {
          fontSize: 21,

          color: "#b77cff",
        },
      }}
    >
      {icon}

      <Typography
        sx={{
          fontSize: 9,

          color: "#cbd5e1",

          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function MemoryStat({
  label,
  value,
}) {
  return (
    <Box
      sx={{
        display: "flex",

        alignItems: "center",

        justifyContent:
          "space-between",

        py: 0.8,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          color: "#cbd5e1",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: "#b77cff",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function formatMemoryTime(
  dateString
) {
  if (!dateString) {
    return "";
  }

  const date =
    new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

  function CalculatorDialog({
  open,
  onClose,
}) {
  const [display, setDisplay] =
    useState("");

  function append(value) {
    setDisplay(
      (previous) =>
        previous + value
    );
  }

  function clear() {
    setDisplay("");
  }

  function calculate() {
    try {
      const result =
        Function(
          `"use strict"; return (${display})`
        )();

      setDisplay(
        String(result)
      );
    } catch {
      setDisplay("Erreur");
    }
  }

  const buttons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "−"],
    ["0", ".", "C", "="],
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 340,

          borderRadius: 4,

          background:
            "linear-gradient(180deg, #101827, #070d17)",

          color: "white",

          border:
            "1px solid rgba(148,163,184,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",

          fontSize: 15,

          fontWeight: 700,
        }}
      >
        CALCULATRICE

        <IconButton
          onClick={onClose}
          sx={{
            color: "#94a3b8",
          }}
        >
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            mb: 2,

            p: 2,

            minHeight: 60,

            display: "flex",

            alignItems: "center",

            justifyContent:
              "flex-end",

            borderRadius: 2,

            background:
              "rgba(2,6,23,0.8)",

            fontSize: 24,

            fontFamily:
              "monospace",

            overflow: "hidden",
          }}
        >
          {display || "0"}
        </Box>

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns:
              "repeat(4, 1fr)",

            gap: 1,
          }}
        >
          {buttons.flat().map(
            (button) => (
              <Box
                key={button}
                onClick={() => {
                  if (
                    button === "C"
                  ) {
                    clear();
                    return;
                  }

                  if (
                    button === "="
                  ) {
                    calculate();
                    return;
                  }

                  const value =
                    button === "÷"
                      ? "/"
                      : button === "×"
                        ? "*"
                        : button === "−"
                          ? "-"
                          : button;

                  append(value);
                }}
                sx={{
                  height: 58,

                  display: "flex",

                  alignItems: "center",
                  justifyContent:
                    "center",

                  borderRadius: 2,

                  cursor: "pointer",

                  background:
                    button === "="
                      ? "linear-gradient(135deg, #8b5cf6, #5b21b6)"
                      : "rgba(30,41,59,0.65)",

                  color: "white",

                  fontSize: 18,

                  userSelect: "none",

                  "&:hover": {
                    background:
                      "rgba(139,92,246,0.30)",
                  },
                }}
              >
                {button}
              </Box>
            )
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   VISUALISATION AUDIO
============================================================ */

function AudioWave() {
  const bars = [
    5, 9, 14, 8, 20, 11, 27,
    17, 31, 15, 23, 10, 18,
    7, 13, 6, 22, 12, 29,
    15, 8, 18, 11, 25, 7, 14, 5,
  ];

  return (
    <Box
      sx={{
        height: 22,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        gap: 0.35,

        opacity: 0.75,
      }}
    >
      {bars.map((height, index) => (
        <Box
          key={index}
          sx={{
            width: 2,

            height: Math.min(height, 20),

            borderRadius: 5,

            background:
              "linear-gradient(180deg, #a855f7, #4c1d95)",

            boxShadow:
              "0 0 6px rgba(139,92,246,0.30)",
          }}
        />
      ))}
    </Box>
  );
}
