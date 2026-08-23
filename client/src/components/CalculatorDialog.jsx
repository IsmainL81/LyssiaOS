import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

import { useState } from "react";

export default function CalculatorDialog({
  open,
  onClose,
}) {
  const [display, setDisplay] =
    useState("");

  function append(value) {
    setDisplay(
      (previous) =>
        previous + value
    );
  }

  function clear() {
    setDisplay("");
  }

  function calculate() {
    try {
      const result =
        Function(
          `"use strict"; return (${display})`
        )();

      setDisplay(
        String(result)
      );
    } catch {
      setDisplay("Erreur");
    }
  }

  const buttons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "−"],
    ["0", ".", "C", "="],
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 340,

          borderRadius: 4,

          background:
            "linear-gradient(180deg, #101827, #070d17)",

          color: "white",

          border:
            "1px solid rgba(148,163,184,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          fontSize: 15,
          fontWeight: 700,
        }}
      >
        CALCULATRICE

        <IconButton
          onClick={onClose}
          sx={{
            color: "#94a3b8",
          }}
        >
          ×
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            mb: 2,
            p: 2,
            minHeight: 60,

            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",

            borderRadius: 2,

            background:
              "rgba(2,6,23,0.8)",

            fontSize: 24,
            fontFamily: "monospace",

            overflow: "hidden",
          }}
        >
          {display || "0"}
        </Box>

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns:
              "repeat(4, 1fr)",

            gap: 1,
          }}
        >
          {buttons.flat().map(
            (button) => (
              <Box
                key={button}
                onClick={() => {
                  if (button === "C") {
                    clear();
                    return;
                  }

                  if (button === "=") {
                    calculate();
                    return;
                  }

                  const value =
                    button === "÷"
                      ? "/"
                      : button === "×"
                        ? "*"
                        : button === "−"
                          ? "-"
                          : button;

                  append(value);
                }}
                sx={{
                  height: 58,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  borderRadius: 2,

                  cursor: "pointer",

                  background:
                    button === "="
                      ? "linear-gradient(135deg, #8b5cf6, #5b21b6)"
                      : "rgba(30,41,59,0.65)",

                  color: "white",

                  fontSize: 18,

                  userSelect: "none",

                  "&:hover": {
                    background:
                      "rgba(139,92,246,0.30)",
                  },
                }}
              >
                {button}
              </Box>
            )
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}