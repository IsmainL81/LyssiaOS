import { Box } from "@mui/material";

import {
  getStatusMeta,
  MODULES,
} from "../core/StatusEngine";

function SystemStatusLine({
  label,
  status,
  extra,
}) {
  const meta = getStatusMeta(status);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        py: 0.8,
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
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            flexShrink: 0,
            backgroundColor: meta.color,
            boxShadow:
              `0 0 8px ${meta.color}`,
          }}
        />

        <Box
          component="span"
          sx={{
            fontSize: 11,
            color: "#cbd5e1",
          }}
        >
          {label}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.8,
          flexShrink: 0,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: 10,
            color: meta.color,
            fontWeight: 600,
          }}
        >
          {meta.label}
        </Box>

        {extra && (
          <Box
            component="span"
            sx={{
              fontSize: 9,
              color: "#64748b",
            }}
          >
            {extra}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function SystemStatusPanel({
  systemState = {},
  memories = [],
}) {
  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <SystemStatusLine
        label="IA"
        status={systemState?.[MODULES.AI]}
      />

      <SystemStatusLine
        label="Avatar"
        status={systemState?.[MODULES.AVATAR]}
      />

      <SystemStatusLine
        label="Mémoire"
        status={systemState?.[MODULES.MEMORY]}
        extra={`${memories.length} souvenir${
          memories.length > 1 ? "s" : ""
        }`}
      />

      <SystemStatusLine
        label="Vision"
        status={systemState?.[MODULES.VISION]}
      />

      <SystemStatusLine
        label="Voix"
        status={systemState?.[MODULES.VOICE]}
      />

      <SystemStatusLine
        label="Robot"
        status={systemState?.[MODULES.ROBOT]}
      />
    </Box>
  );
}