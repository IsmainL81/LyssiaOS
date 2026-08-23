import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useLyssia } from "../../core/LyssiaCore";

const STATE_META = {
  online: {
    label: "Présente",
    color: "#59f5a0",
  },

  thinking: {
    label: "Réflexion",
    color: "#b77cff",
  },

  speaking: {
    label: "Parle",
    color: "#59d9ff",
  },

  offline: {
    label: "Hors ligne",
    color: "#64748b",
  },

  error: {
    label: "Erreur",
    color: "#ff647c",
  },
};

function getTime() {
  return new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function SystemConsole() {
  const { systemState } = useLyssia();

  const currentState = systemState?.ai || "online";

  const state =
    STATE_META[currentState] || STATE_META.online;

  const previousState = useRef(currentState);

  const [logs, setLogs] = useState([
    {
      id: Date.now(),
      time: getTime(),
      text: "Lyssia OS initialisé.",
      color: "#59f5a0",
    },
  ]);

  useEffect(() => {
    if (previousState.current === currentState) {
      return;
    }

    previousState.current = currentState;

    const messages = {
      online: "Lyssia est présente.",
      thinking: "Lyssia réfléchit...",
      speaking: "Lyssia parle.",
      offline: "Lyssia est hors ligne.",
      error: "Erreur détectée dans Lyssia.",
    };

    const message =
      messages[currentState] ||
      "État de Lyssia modifié.";

    setLogs((previous) => [
      ...previous,
      {
        id: Date.now(),
        time: getTime(),
        text: message,
        color: state.color,
      },
    ]);
  }, [currentState, state.color]);

  return (
    <Box
      sx={{
        height: 150,
        minHeight: 150,

        display: "flex",
        flexDirection: "column",

        background: "#080d17",

        borderTop: "1px solid #24354d",
      }}
    >
      {/* ================================================
          HEADER
         ================================================= */}

      <Box
        sx={{
          height: 42,
          minHeight: 42,

          px: 2,

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          borderBottom: "1px solid #1c2a3d",
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,

            letterSpacing: 1.5,

            color: "#94a3b8",
          }}
        >
          SYSTEM CONSOLE
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,

              borderRadius: "50%",

              backgroundColor: state.color,

              boxShadow: `0 0 10px ${state.color}`,
            }}
          />

          <Typography
            sx={{
              fontSize: 11,
              color: state.color,
              letterSpacing: 0.8,
            }}
          >
            {state.label}
          </Typography>
        </Box>
      </Box>

      {/* ================================================
          LOGS
         ================================================= */}

      <Box
        sx={{
          flex: 1,

          overflowY: "auto",

          px: 2,
          py: 1,

          fontFamily:
            '"Roboto Mono", monospace',
        }}
      >
        {logs.map((log) => (
          <Box
            key={log.id}
            sx={{
              display: "flex",
              gap: 1,

              mb: 0.5,

              fontSize: 11,
            }}
          >
            <Typography
              component="span"
              sx={{
                color: "#475569",
                fontSize: 11,
                fontFamily:
                  '"Roboto Mono", monospace',
              }}
            >
              [{log.time}]
            </Typography>

            <Typography
              component="span"
              sx={{
                color: log.color,
                fontSize: 11,
                fontFamily:
                  '"Roboto Mono", monospace',
              }}
            >
              {log.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}