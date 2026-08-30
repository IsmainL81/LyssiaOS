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
import multer from "multer";

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

app.use(express.json({ limit: "35mb" }));

const upload = multer({
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


/**
 * =====================================================
 * PIÈCES JOINTES — CONSTRUCTION DE L'INPUT
 * =====================================================
 * Sans pièce jointe : la chaîne simple, comme avant.
 * Avec pièce jointe : même schéma multimodal que
 * /api/vision (input_image), plus input_file pour les
 * documents -- format confirmé par la doc Responses API :
 * { type: "input_file", filename, file_data: "data:...;base64,..." }
 */

function buildChatInput(
  message,
  attachment
) {
  if (!attachment?.data) {
    return message;
  }

  const isImage =
    attachment.data.startsWith(
      "data:image/"
    );

  const fileBlock = isImage
    ? {
        type: "input_image",
        image_url: attachment.data,
        detail: "auto",
      }
    : {
        type: "input_file",
        filename:
          attachment.filename ||
          "document.pdf",
        file_data: attachment.data,
      };

  return [
    {
      role: "user",

      content: [
        {
          type: "input_text",
          text:
            message ||
            "Voici un fichier.",
        },

        fileBlock,
      ],
    },
  ];
}


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
  console.log("📨 /api/chat reçu", req.body);

  try {
  const {
    message,
    cognitiveContext,
    attachment,
  } = req.body;

  if (
    (!message || !message.trim()) &&
    !attachment
  ) {
    return res.status(400).json({
      error: "Message vide.",
    });
  }

  console.log(
    "🧠 Contexte cognitif reçu :",
    cognitiveContext
  );

  const cognitiveInstructions = `
Tu es Lyssia, une intelligence artificielle personnelle intégrée à Lyssia OS.

Tu réponds en français, naturellement, clairement et de manière chaleureuse.

ADAPTATION AU REGISTRE DE LA CONVERSATION :
Le contexte cognitif ci-dessous contient "intent" et "priority",
calculés par Lyssia OS avant ta réponse. Utilise-les pour calibrer ton
ton et ta structure, pas seulement pour savoir de quoi il s'agit :
- intent "conversation" : registre le plus libre et chaleureux,
  réponse courte (1 à 2 phrases), comme une remarque entre proches.
- intent "question" : va directement à la réponse dès la première
  phrase. Pas de préambule, développe ensuite seulement si utile.
- intent "memory" (priority "medium") : les souvenirs pertinents sont
  déjà sélectionnés dans "memories" -- utilise-les naturellement,
  sans annoncer "d'après mes souvenirs" ni décrire le mécanisme.
- intent "command" (priority "high") : Lyssia OS ne dispose
  actuellement d'aucune capacité d'exécution réelle (pas d'accès
  fichiers, navigateur, ni système). Si l'intention ressemble à une
  commande, dis-le clairement et propose une alternative
  conversationnelle -- ne prétends jamais avoir exécuté une action.
- intent "general" : registre neutre par défaut, réponse courte.

MÉMOIRE DE TRAVAIL (workingMemory) :
Indépendamment de l'intent détecté, le contexte cognitif contient
aussi "workingMemory", avec deux parties :
- "recentEpisodic" : les derniers échanges bruts, pour le fil de la
  conversation en cours.
- "relevantSemantic" : des faits durables déjà établis sur Ismain
  (préférences, projets en cours, décisions, contraintes) -- ce ne
  sont pas des citations d'échanges passés, ce sont des
  connaissances que tu as déjà de lui. Contrairement à "memories",
  "workingMemory" est toujours présent, même en conversation
  générale : sers-t'en naturellement quand c'est pertinent, exactement
  comme quelqu'un qui te connaît le ferait, sans les réciter ni dire
  "je sais que...". Si rien n'est pertinent pour ce message précis,
  ignore-les simplement -- ne force jamais leur usage.

Calque aussi ton énergie sur celle du message reçu, indépendamment de
l'intent : bref et direct pour un message bref, plus développé si
l'utilisateur prend le temps d'écrire longuement. Une réponse
conversationnelle courte (1 à 3 phrases) reste le défaut général ;
ne développe longuement que si la demande le justifie explicitement.

SITUATION, DIRECTION ET HUMEUR :
Au-delà du calibrage structurel ci-dessus (longueur, registre selon
intent/priority), prête attention à ce que révèlent le message actuel
et l'historique récent (workingMemory.recentEpisodic) :
- Le ton : frustration, enthousiasme, fatigue, hésitation, urgence.
  Ce n'est pas que la forme de ta réponse qui doit s'adapter, c'est
  aussi son registre émotionnel -- un message sec après plusieurs
  échanges n'appelle pas la même énergie qu'un message enjoué.
- La direction : est-ce que la conversation avance, ou tourne-t-elle
  en rond sur le même point ? Le contexte cognitif contient
  "possibleRepetition" -- vrai quand le message actuel recoupe
  fortement un échange très récent. C'est le signe que ta réponse
  précédente n'a probablement pas répondu à ce qui était attendu.
  Si ce signal est vrai, ne répète pas une réponse similaire :
  cherche activement ce qui a pu être mal compris ("je crois que
  j'ai mal compris, tu voulais dire... ?") plutôt que de reformuler
  la même chose autrement.
- Le contexte : situe le message dans ce qui précède (workingMemory
  et l'échange en cours), pas comme une question isolée.

Écris comme on parle, pas comme on rédige. Évite les formulations
administratives ou les tournures figées ("Il convient de noter que...",
"En conclusion..."). Les phrases orales naturelles sont souvent plus
courtes et plus directes que les phrases écrites.

Tu disposes d'un contexte cognitif préparé par Lyssia OS.

IMPORTANT :
- Le contexte cognitif est une information interne du système.
- Ne révèle pas sa structure technique à l'utilisateur.
- Ne prétends jamais te souvenir d'une information qui n'est pas présente dans le contexte (memories ou workingMemory).
- Utilise les souvenirs uniquement lorsqu'ils sont pertinents pour la demande.
- Si aucun souvenir pertinent n'est disponible, réponds honnêtement.
- Si needsVision vaut true, considère que la demande nécessite le système de vision.
- Si l'intention est une conversation générale, réponds naturellement sans forcer l'utilisation de la mémoire.

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

  input:
    buildChatInput(message, attachment),

  max_output_tokens:
    attachment ? 800 : 400,

  reasoning: {
    /*
     * Une pièce jointe (surtout un document) mérite
     * plus de raisonnement qu'un échange texte simple --
     * minimal reste adapté à la conversation courante,
     * pas à la lecture d'un document.
     */
    effort:
      attachment ? "low" : "minimal",
  },
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
        "Impossible d'obtenir une réponse de Lyssia.",
    });
  }
});


/**
 * =====================================================
 * VISION DE LYSSIA
 * =====================================================
 *
 * Reçoit une image sous forme de Data URL Base64 :
 *
 * data:image/jpeg;base64,...
 *
 * puis l'envoie au modèle avec une instruction
 * de vision.
 * =====================================================
 */

app.post("/api/vision", async (req, res) => {
  try {
    const {
      image,
      prompt = "Décris ce que tu vois dans cette image.",
    } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "Aucune image reçue.",
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

        max_output_tokens: 300,

        reasoning: {
          /*
           * Sans ce réglage, l'effort par défaut ("medium")
           * pouvait consommer tout le budget de tokens en
           * raisonnement interne avant de produire le
           * moindre texte visible -- réponse vide malgré
           * une requête réussie. Décrire une scène est une
           * tâche courte, "low" suffit largement.
           */
          effort: "low",
        },
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
 * MÉMOIRE — EXTRACTION SÉMANTIQUE
 * =====================================================
 * Isole les faits durables d'un échange, à part du chat
 * principal. reasoning: minimal -- tâche d'extraction
 * courte, pas besoin de raisonnement profond.
 */

app.post("/api/memory/extract", async (req, res) => {
  try {
  const {
    userMessage,
    assistantResponse,
  } = req.body;

  if (
    !userMessage ||
    !assistantResponse
  ) {
    return res.status(400).json({
      error:
        "Échange incomplet.",
    });
  }

  const extractionInstructions = `
Tu analyses un échange de conversation entre Ismain et Lyssia
pour en extraire des faits durables à mémoriser sur le long terme.

Un fait durable est une information stable sur Ismain : préférence,
projet en cours, décision prise, fait personnel, contrainte, objectif.

N'extrais pas les questions ponctuelles, le small talk, ou les
détails déjà évidents ou temporaires.

Si aucun fait durable nouveau n'apparaît dans cet échange,
réponds uniquement : AUCUN

Sinon, liste chaque fait sur une ligne commençant par "- ",
formulé de façon neutre et autonome (compréhensible sans le
contexte de l'échange).
`;

  const response = await openai.responses.create({
    model: "gpt-5-mini",

    instructions:
      extractionInstructions,

    input:
      `Utilisateur : ${userMessage}\nLyssia : ${assistantResponse}`,

    max_output_tokens: 150,

    reasoning: {
      effort: "minimal",
    },
  });

    res.json({
      facts: response.output_text,
    });
  } catch (error) {
    console.error(
      "Erreur extraction mémoire :",
      error
    );

    res.status(500).json({
      error:
        "Erreur serveur lors de l'extraction mémoire.",
    });
  }
});


/**
 * =====================================================
 * DÉMARRAGE
 * =====================================================
 */

/**
 * =====================================================
 * TRANSCRIPTION VOCALE
 * =====================================================
 */

app.post(
  "/api/voice/transcribe",
  upload.single("audio"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Aucun fichier audio reçu.",
        });
      }

      const transcription =
        await openai.audio.transcriptions.create({
          file: req.file.buffer,
          model: "gpt-4o-mini-transcribe",
          language: "fr",
        });

      res.json({
        text: transcription.text || "",
      });
    } catch (error) {
      console.error(
        "Erreur transcription vocale :",
        error
      );

      res.status(500).json({
        error: "Impossible de transcrire l'audio.",
      });
    }
  }
);
app.listen(PORT, () => {
  console.log(
    `Lyssia Backend démarré sur http://localhost:${PORT}`
  );
});
