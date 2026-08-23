import { Box, Typography } from "@mui/material";

import {
  getStatusMeta,
  MODULES,
} from "../core/StatusEngine";

function ContextLine({
  icon,
  label,
  value,
  color = "#cbd5e1",
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        py: 0.7,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            width: 20,
            fontSize: 13,
            textAlign: "center",
          }}
        >
          {icon}
        </Typography>

        <Typography
          sx={{
            fontSize: 11,
            color: "#94a3b8",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function ContextPanel({
  systemState = {},
}) {
  const now = new Date();

  const time = now.toLocaleTimeString(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const date = now.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  const aiStatus =
    getStatusMeta(
      systemState?.[MODULES.AI]
    );

  const visionStatus =
    getStatusMeta(
      systemState?.[MODULES.VISION]
    );

  const voiceStatus =
    getStatusMeta(
      systemState?.[MODULES.VOICE]
    );

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <ContextLine
        icon="📍"
        label="Lieu"
        value="Dieppe, France"
      />

      <ContextLine
        icon="🕐"
        label="Heure"
        value={time}
      />

      <ContextLine
        icon="📅"
        label="Date"
        value={date}
      />

      <ContextLine
        icon="🧠"
        label="IA"
        value={aiStatus.label}
        color={aiStatus.color}
      />

      <ContextLine
        icon="👁️"
        label="Vision"
        value={visionStatus.label}
        color={visionStatus.color}
      />

      <ContextLine
        icon="🔊"
        label="Voix"
        value={voiceStatus.label}
        color={voiceStatus.color}
      />
    </Box>
  );
}