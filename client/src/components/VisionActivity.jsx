import { Box, Typography } from "@mui/material";

export default function VisionActivity({
  visionEvents = [],
}) {
  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {/* ÉTAT */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: "#59f5a0",
            boxShadow:
              "0 0 10px #59f5a0",
            flexShrink: 0,
          }}
        />

        <Typography
          sx={{
            fontSize: 11,
            color: "#59f5a0",
          }}
        >
          Vision autonome active
        </Typography>
      </Box>

      {/* ÉVÉNEMENTS */}
      {visionEvents.length === 0 ? (
        <Typography
          sx={{
            fontSize: 11,
            color: "#64748b",
          }}
        >
          Aucun événement détecté.
        </Typography>
      ) : (
        visionEvents
          .slice(0, 5)
          .map((event) => {
            const time =
              event.createdAt
                ? new Date(
                    event.createdAt
                  ).toLocaleTimeString(
                    "fr-FR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }
                  )
                : "--:--:--";

            return (
              <Box
                key={event.id}
                sx={{
                  display: "flex",
                  gap: 1,
                  py: 0.8,

                  borderBottom:
                    "1px solid rgba(148,163,184,0.06)",
                }}
              >
                {/* HEURE */}

                <Typography
                  sx={{
                    fontSize: 9,
                    color: "#475569",

                    fontFamily:
                      '"Roboto Mono", monospace',

                    minWidth: 55,
                    flexShrink: 0,
                  }}
                >
                  {time}
                </Typography>

                {/* INDICATEUR */}

                <Box
                  sx={{
                    width: 6,
                    height: 6,

                    mt: 0.55,

                    flexShrink: 0,

                    borderRadius: "50%",

                    backgroundColor:
                      "#b77cff",

                    boxShadow:
                      "0 0 7px #b77cff",
                  }}
                />

                {/* MESSAGE */}

                <Typography
                  sx={{
                    fontSize: 10,

                    lineHeight: 1.4,

                    color: "#cbd5e1",
                  }}
                >
                  {event.message}
                </Typography>
              </Box>
            );
          })
      )}
    </Box>
  );
}