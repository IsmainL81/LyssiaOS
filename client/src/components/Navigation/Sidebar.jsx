import {
  Dashboard,
  SmartToy,
  Psychology,
  Visibility,
  Memory,
  Settings,
  TaskAlt,
  Build,
  Circle,
} from "@mui/icons-material";

import {
  Box,
  Typography,
} from "@mui/material";

const items = [
  {
    icon: <Dashboard />,
    label: "Accueil",
    path: "/",
  },
  {
    icon: <Psychology />,
    label: "Conversation",
    path: "/conversation",
  },
  {
    icon: <Memory />,
    label: "Mémoire",
    path: "/memory",
  },
  {
    icon: <Visibility />,
    label: "Vision",
    path: "/vision",
  },
  {
    icon: <TaskAlt />,
    label: "Tâches",
    path: "/tasks",
  },
  {
    icon: <Build />,
    label: "Outils",
    path: "/tools",
  },
  {
    icon: <Settings />,
    label: "Paramètres",
    path: "/settings",
  },
];

export default function Sidebar() {
  function navigate(path) {
    window.history.pushState({}, "", path);

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );
  }

  return (
    <Box
      sx={{
        width: 240,
        minWidth: 240,
        height: "100vh",
        boxSizing: "border-box",

        display: "flex",
        flexDirection: "column",

        px: 2,
        py: 3,

        background:
          "linear-gradient(180deg, #050912 0%, #02050b 100%)",

        color: "white",

        borderRight:
          "1px solid rgba(148,163,184,0.12)",

        overflow: "hidden",
      }}
    >
      {/* =====================================================
          LOGO
      ===================================================== */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1,
          mb: 4,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "50%",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            background:
              "radial-gradient(circle, #8b5cf6 0%, #4c1d95 70%)",

            boxShadow:
              "0 0 25px rgba(139,92,246,0.35)",

            fontSize: 20,
          }}
        >
          ✦
        </Box>

        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: -0.5,
          }}
        >
          Lyssia OS
        </Typography>
      </Box>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.7,
        }}
      >
        {items.map((item, index) => {
          const active = index === 0;

          return (
            <Box
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 56,

                display: "flex",
                alignItems: "center",

                gap: 1.8,

                px: 1.8,

                borderRadius: 2.5,

                cursor: "pointer",

                color: active
                  ? "#dbeafe"
                  : "#d1d5db",

                background: active
                  ? "linear-gradient(90deg, rgba(91,61,190,0.42), rgba(91,61,190,0.20))"
                  : "transparent",

                border: active
                  ? "1px solid rgba(139,92,246,0.16)"
                  : "1px solid transparent",

                transition:
                  "all 180ms ease",

                "&:hover": {
                  background:
                    "rgba(139,92,246,0.16)",

                  color: "white",

                  transform:
                    "translateX(2px)",
                },

                "& svg": {
                  fontSize: 22,

                  color: active
                    ? "#8b8cff"
                    : "#d1d5db",
                },
              }}
            >
              {item.icon}

              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: active
                    ? 500
                    : 400,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* =====================================================
          SÉPARATEUR
      ===================================================== */}

      <Box
        sx={{
          mt: 3,
          mb: 2.5,
          mx: 1,
          height: "1px",
          background:
            "rgba(148,163,184,0.14)",
        }}
      />

      {/* =====================================================
          STATUT SYSTÈME
      ===================================================== */}

      <Typography
        sx={{
          px: 1,
          mb: 1.5,

          fontSize: 11,
          fontWeight: 600,

          letterSpacing: 1.2,

          color: "#64748b",
        }}
      >
        STATUT SYSTÈME
      </Typography>

      <SystemStatus
        label="Vision"
        value="Active"
        color="#22c55e"
      />

      <SystemStatus
        label="Mémoire"
        value="Active"
        color="#22c55e"
      />

      <SystemStatus
        label="Voix"
        value="En veille"
        color="#8b5cf6"
      />

      <SystemStatus
        label="Connectivité"
        value="En ligne"
        color="#22c55e"
      />

      {/* =====================================================
          ESPACE
      ===================================================== */}

      <Box sx={{ flex: 1 }} />

      {/* =====================================================
          PROFIL
      ===================================================== */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",

          gap: 1.3,

          p: 1.2,

          borderRadius: 2.5,

          background:
            "rgba(15,23,42,0.72)",

          border:
            "1px solid rgba(148,163,184,0.10)",
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,

            borderRadius: "50%",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            background:
              "linear-gradient(135deg, #9a6a43, #5d3828)",

            color: "#fff",

            fontWeight: 700,

            fontSize: 14,
          }}
        >
          IL
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Ismain LHERBÉ
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: "#64748b",
              mt: 0.2,
            }}
          >
            Compte principal
          </Typography>
        </Box>

        <Box
          sx={{
            ml: "auto",
            color: "#94a3b8",
            fontSize: 16,
          }}
        >
         ⌄
        </Box>
      </Box>
    </Box>
  );
}


/* ============================================================
   STATUT
============================================================ */

function SystemStatus({
  label,
  value,
  color,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",

        gap: 1.2,

        px: 1,
        py: 0.8,
      }}
    >
      <Circle
        sx={{
          width: 8,
          height: 8,
          color,
        }}
      />

      <Typography
        sx={{
          fontSize: 13,
          color: "#cbd5e1",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          ml: "auto",
          fontSize: 12,
          color,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}