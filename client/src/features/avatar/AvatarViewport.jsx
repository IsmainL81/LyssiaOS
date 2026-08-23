import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

export default function AvatarViewport() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(circle at center, #1b3c63 0%, #0b1220 75%)",
        overflow: "hidden",
      }}
    >
      {/* Halo lumineux */}
      <Box
        sx={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,180,255,.35) 0%, rgba(0,180,255,0) 70%)",
          filter: "blur(40px)",
        }}
      />

      <MotionCard
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: [1, 1.01, 1],
        }}
        transition={{
          opacity: { duration: 1.5 },
          scale: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        sx={{
          position: "relative",
          width: 520,
          background: "rgba(18,25,38,.80)",
          backdropFilter: "blur(18px)",
          borderRadius: 5,
          color: "white",
          border: "1px solid rgba(0,180,255,.25)",
          boxShadow: "0 0 40px rgba(0,180,255,.20)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 3,
          }}
        >
          <Box
            sx={{
              width: 320,
              height: 440,
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 0 30px rgba(0,180,255,.35)",
            }}
          >
            <img
              src="/images/lyssia-v1.png"
              alt="Lyssia"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
        </Box>

        <CardContent sx={{ textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            LYSSIA
          </Typography>

          <Typography
            sx={{
              color: "#8aa7c9",
              mb: 3,
            }}
          >
            Artificial Humanoid Intelligence
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Chip color="success" label="IA ACTIVE" />
            <Chip color="info" label="VISION READY" />
            <Chip color="warning" label="ROBOT OFFLINE" />
            <Chip color="secondary" label="MEMORY ONLINE" />
          </Box>
        </CardContent>
      </MotionCard>
    </Box>
  );
}