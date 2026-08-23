import { Box, Typography } from "@mui/material";

export default function MemoryPanel({
  memories = [],
}) {
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
      }}
    >
      {/* STATISTIQUES */}

      <MemoryStat
        label="Souvenirs"
        value={memories.length}
      />

      <MemoryStat
        label="Conversations"
        value={
          conversationMemories.length
        }
      />

      <MemoryStat
        label="Perceptions visuelles"
        value={
          visionMemories.length
        }
      />

      {/* DERNIER SOUVENIR */}

      {latestMemory && (
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,

            borderTop:
              "1px solid rgba(148,163,184,0.10)",
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              color: "#64748b",
              mb: 0.6,

              textTransform:
                "uppercase",

              letterSpacing: 0.8,
            }}
          >
            Dernier souvenir
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              lineHeight: 1.5,

              color: "#cbd5e1",

              display:
                "-webkit-box",

              WebkitLineClamp: 3,

              WebkitBoxOrient:
                "vertical",

              overflow: "hidden",
            }}
          >
            {latestMemory.content}
          </Typography>
        </Box>
      )}

      {/* PROGRESSION */}

      <Box
        sx={{
          mt: 2,
          pt: 2,

          borderTop:
            "1px solid rgba(148,163,184,0.10)",
        }}
      >
        <ProgressItem
          title="Objectif principal"
          subtitle="Développer Lyssia OS"
          value={75}
        />

        <ProgressItem
          title="TOEIC 950+"
          subtitle="Préparation en cours"
          value={60}
        />

        <ProgressItem
          title="BTS PI"
          subtitle="Session 2026"
          value={80}
        />
      </Box>
    </Box>
  );
}


/* =====================================================
   STATISTIQUE MÉMOIRE
===================================================== */

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


/* =====================================================
   PROGRESSION
===================================================== */

function ProgressItem({
  title,
  subtitle,
  value,
}) {
  return (
    <Box
      sx={{
        mb: 1.5,

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

          mb: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 10,

            color: "#cbd5e1",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 9,

            color: "#64748b",
          }}
        >
          {value}%
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: 9,

          color: "#64748b",

          mb: 0.6,
        }}
      >
        {subtitle}
      </Typography>

      <Box
        sx={{
          height: 4,

          borderRadius: 2,

          backgroundColor:
            "rgba(148,163,184,0.10)",

          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${value}%`,

            height: "100%",

            borderRadius: 2,

            background:
              "linear-gradient(90deg, #8b5cf6, #b77cff)",
          }}
        />
      </Box>
    </Box>
  );
}