import { Box, Typography } from "@mui/material";

import {
  ImageSearch,
  Psychology,
} from "@mui/icons-material";

export default function InteractionsPanel({
  memories = [],
  formatMemoryTime,
}) {
  const interactions =
    memories.slice(0, 4);

  if (interactions.length === 0) {
    return (
      <Typography
        sx={{
          fontSize: 12,
          color: "#64748b",
          py: 1,
        }}
      >
        Aucune interaction enregistrée.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {interactions.map((memory) => (
        <Interaction
          key={memory.id}
          icon={
            memory.type === "vision"
              ? <ImageSearch />
              : <Psychology />
          }
          text={memory.content}
          time={
            formatMemoryTime
              ? formatMemoryTime(
                  memory.createdAt
                )
              : ""
          }
        />
      ))}
    </Box>
  );
}


/* =====================================================
   INTERACTION
===================================================== */

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

        borderBottom:
          "1px solid rgba(148,163,184,0.06)",

        "&:last-child": {
          borderBottom: "none",
        },
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,

          display: "flex",

          alignItems: "center",
          justifyContent: "center",

          flexShrink: 0,

          borderRadius: 2,

          color: "#b77cff",

          background:
            "rgba(139,92,246,0.08)",

          "& svg": {
            fontSize: 16,
          },
        }}
      >
        {icon}
      </Box>

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,

            color: "#cbd5e1",

            lineHeight: 1.4,

            overflow: "hidden",

            textOverflow: "ellipsis",

            whiteSpace: "nowrap",
          }}
        >
          {text}
        </Typography>

        {time && (
          <Typography
            sx={{
              mt: 0.2,

              fontSize: 9,

              color: "#64748b",
            }}
          >
            {time}
          </Typography>
        )}
      </Box>
    </Box>
  );
}