import { Box } from "@mui/material";

export default function AudioWave() {
  const bars = [
    5, 9, 14, 8, 20, 11, 27,
    17, 31, 15, 23, 10, 18,
    7, 13, 6, 22, 12, 29,
    15, 8, 18, 11, 25, 7, 14, 5,
  ];

  return (
    <Box
      sx={{
        height: 22,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        gap: 0.35,

        opacity: 0.75,
      }}
    >
      {bars.map((height, index) => (
        <Box
          key={index}
          sx={{
            width: 2,

            height: Math.min(height, 20),

            borderRadius: 5,

            background:
              "linear-gradient(180deg, #a855f7, #4c1d95)",

            boxShadow:
              "0 0 6px rgba(139,92,246,0.30)",
          }}
        />
      ))}
    </Box>
  );
}