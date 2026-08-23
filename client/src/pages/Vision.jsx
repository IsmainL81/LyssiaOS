import { Box } from "@mui/material";

import CameraView from "../components/CameraView";

export default function Vision() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,

        display: "flex",
        flexDirection: "column",
      }}
    >
      <CameraView />
    </Box>
  );
}