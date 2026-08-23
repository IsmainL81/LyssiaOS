import { Box, Typography } from "@mui/material";
import { useLyssia } from "../../core/LyssiaCore";

const STATE_META = {
  online: {
    label: "PRÉSENTE",
    color: "#59f5a0",
  },

  thinking: {
    label: "RÉFLEXION",
    color: "#b77cff",
  },

  speaking: {
    label: "PARLE",
    color: "#59d9ff",
  },

  offline: {
    label: "HORS LIGNE",
    color: "#64748b",
  },

  error: {
    label: "ERREUR",
    color: "#ff647c",
  },
};

export default function Topbar() {
  const { systemState } = useLyssia();

  const currentState = systemState?.ai || "online";

  const state =
    STATE_META[currentState] || STATE_META.online;

  return (
    <Box
      sx={{
        height: 64,
        minHeight: 64,

        px: 3,

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        backgroundColor: "#111827",

        borderBottom: "1px solid #24354d",

        transition:
          "background-color 400ms ease, border-color 400ms ease",
      }}
    >
      {/* =================================================
          IDENTITÉ
         ================================================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 2,
            color: "white",
          }}
        >
          LYSSIA OS
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: "#64748b",
            letterSpacing: 1,
          }}
        >
          V1.0
        </Typography>
      </Box>

      {/* =================================================
          ÉTAT DE LYSSIA
         ================================================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,

          transition:
            "color 400ms ease",
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,

            borderRadius: "50%",

            backgroundColor: state.color,

            boxShadow: `0 0 14px ${state.color}`,

            animation:
              currentState === "thinking"
                ? "topbarPulse 1.2s ease-in-out infinite"
                : currentState === "speaking"
                  ? "topbarPulse 0.7s ease-in-out infinite"
                  : "none",

            "@keyframes topbarPulse": {
              "0%, 100%": {
                transform: "scale(0.85)",
                opacity: 0.7,
              },

              "50%": {
                transform: "scale(1.15)",
                opacity: 1,
              },
            },
          }}
        />

        <Typography
          sx={{
            fontSize: 13,

            fontWeight: 600,

            letterSpacing: 1.2,

            color: state.color,

            transition: "color 400ms ease",
          }}
        >
          LYSSIA — {state.label}
        </Typography>
      </Box>
    </Box>
  );
}