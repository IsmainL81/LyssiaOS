import { Box } from "@mui/material";

import Sidebar from "../Navigation/Sidebar";

export default function MainLayout({
  children,
}) {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",

        display: "flex",

        overflow: "hidden",

        background:
          "radial-gradient(circle at 50% 0%, #101a2b 0%, #050912 48%, #02050a 100%)",

        color: "white",
      }}
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          ESPACE PRINCIPAL
      ===================================================== */}

      <Box
        component="main"
        sx={{
          flex: 1,

          minWidth: 0,
          height: "100vh",

          overflow: "hidden",

          position: "relative",

          background:
            "radial-gradient(circle at 50% 25%, rgba(35,52,80,0.28) 0%, rgba(5,9,17,0) 48%)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}