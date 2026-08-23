import { Box } from "@mui/material";

import {
  Calculate,
  StickyNote2,
  CalendarMonth,
  Description,
  Search,
  Tune,
} from "@mui/icons-material";

function Tool({
  icon,
  label,
  onClick,
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        minHeight: 68,

        display: "flex",
        flexDirection: "column",

        alignItems: "center",
        justifyContent: "center",

        gap: 0.6,

        borderRadius: 2.5,

        cursor: onClick
          ? "pointer"
          : "default",

        color: "#cbd5e1",

        background:
          "rgba(15,23,42,0.55)",

        border:
          "1px solid rgba(148,163,184,0.08)",

        transition:
          "all 0.2s ease",

        "&:hover": onClick
          ? {
              background:
                "rgba(139,92,246,0.12)",

              borderColor:
                "rgba(139,92,246,0.25)",

              transform:
                "translateY(-1px)",
            }
          : {},
      }}
    >
      <Box
        sx={{
          display: "flex",

          alignItems: "center",
          justifyContent: "center",

          color: "#b77cff",

          "& svg": {
            fontSize: 20,
          },
        }}
      >
        {icon}
      </Box>

      <Box
        component="span"
        sx={{
          fontSize: 9,
          color: "#94a3b8",

          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {label}
      </Box>
    </Box>
  );
}

export default function QuickToolsPanel({
  onCalculator,
}) {
  return (
    <Box
      sx={{
        display: "grid",

        gridTemplateColumns:
          "repeat(3, 1fr)",

        gap: 1,
      }}
    >
      <Tool
        icon={<Calculate />}
        label="Calculatrice"
        onClick={onCalculator}
      />

      <Tool
        icon={<StickyNote2 />}
        label="Notes"
      />

      <Tool
        icon={<CalendarMonth />}
        label="Calendrier"
      />

      <Tool
        icon={<Description />}
        label="Documents"
      />

      <Tool
        icon={<Search />}
        label="Recherche IA"
      />

      <Tool
        icon={<Tune />}
        label="Prompt perso"
      />
    </Box>
  );
}