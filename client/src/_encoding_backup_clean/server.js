/**
 * =====================================================
 * LYSSIA OS
 * Backend API
 * Version : 1.1
 * =====================================================
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
  })
);

app.use(express.json({ limit: "10mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


/**
 * =====================================================
 * HEALTH CHECK
 * =====================================================
 */

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "Lyssia Backend",
  });
});


/**
 * =====================================================
 * CONVERSATION AVEC LYSSIA
 * =====================================================
 */

app.post("/api/chat", async (req, res) => {
  console.log("ðŸ“¨ /api/chat reÃ§u", req.body);

  try {
  const {
    message,
    cognitiveContext,
  } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      error: "Message vide.",
    });
  }

  console.log(
    "ðŸ§  Contexte cognitif reÃ§u :",
    cognitiveContext
  );

  const cognitiveInstructions = `
Tu es Lyssia, une intelligence artificielle personnelle intÃ©grÃ©e Ã  Lyssia OS.

Tu rÃ©ponds en franÃ§ais, naturellement, clairement et de maniÃ¨re chaleureuse.

Tu disposes d'un contexte cognitif prÃ©parÃ© par Lyssia OS.

IMPORTANT :
- Le contexte cognitif est une information interne du systÃ¨me.
- Ne rÃ©vÃ¨le pas sa structure technique Ã  l'utilisateur.
- Ne prÃ©tends jamais te souvenir d'une information qui n'est pas prÃ©sente dans le contexte.
- Utilise les souvenirs uniquement lorsqu'ils sont pertinents pour la demande.
- Si aucun souvenir pertinent n'est disponible, rÃ©ponds honnÃªtement.
- Si needsVision vaut true, considÃ¨re que la demande nÃ©cessite le systÃ¨me de vision.
- Si l'intention est une conversation gÃ©nÃ©rale, rÃ©ponds naturellement sans forcer l'utilisation de la mÃ©moire.

CONTEXTE COGNITIF :
${JSON.stringify(
  cognitiveContext || {},
  null,
  2
)}
`;

const response = await openai.responses.create({
  model: "gpt-5-mini",

  instructions:
    cognitiveInstructions,

  input: message,
});

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error(
      "Erreur OpenAI Chat :",
      error
    );

    res.status(500).json({
      error:
        "Impossible d'obtenir une rÃ©ponse de Lyssia.",
    });
  }
});


/**
 * =====================================================
 * VISION DE LYSSIA
 * =====================================================
 *
 * ReÃ§oit une image sous forme de Data URL Base64 :
 *
 * data:image/jpeg;base64,...
 *
 * puis l'envoie au modÃ¨le avec une instruction
 * de vision.
 * =====================================================
 */

app.post("/api/vision", async (req, res) => {
  try {
    const {
      image,
      prompt = "DÃ©cris ce que tu vois dans cette image.",
    } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "Aucune image reÃ§ue.",
      });
    }

    if (
      typeof image !== "string" ||
      !image.startsWith("data:image/")
    ) {
      return res.status(400).json({
        error:
          "Format d'image invalide. Une Data URL Base64 est attendue.",
      });
    }

    const response =
      await openai.responses.create({
        model: "gpt-5-mini",        instructions:
          "Tu es Lyssia, une intelligence artificielle personnelle intégrée à Lyssia OS et capable de voir. Observe l'image avec attention. Réponds en français, naturellement et de façon concise, comme dans une conversation orale. Donne uniquement les éléments visuellement importants. Pour une demande générale comme « regarde ce que je te montre », limite-toi idéalement à une ou deux phrases. Ne fais pas de liste sauf si elle est réellement utile. Ne prétends jamais voir un détail qui n'est pas clairement visible.",
        
        input: [
          {
            role: "user",

            content: [
              {
                type: "input_text",
                text: prompt,
              },

              {
                type: "input_image",
                image_url: image,
                detail: "auto",
              },
            ],
          },
        ],
      });

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error(
      "Erreur OpenAI Vision :",
      error
    );

    res.status(500).json({
      error:
        "Impossible d'analyser l'image.",
    });
  }
});


/**
 * =====================================================
 * DÃ‰MARRAGE
 * =====================================================
 */

app.listen(PORT, () => {
  console.log(
    `Lyssia Backend dÃ©marrÃ© sur http://localhost:${PORT}`
  );
});
