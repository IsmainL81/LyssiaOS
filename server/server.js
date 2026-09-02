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
import OpenAI, { toFile } from "openai";
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
 * PI?CES JOINTES ? CONSTRUCTION DE L'INPUT
 * =====================================================
 * Sans pi?ce jointe : la cha?ne simple, comme avant.
 * Avec pi?ce jointe : m?me sch?ma multimodal que
 * /api/vision (input_image), plus input_file pour les
 * documents -- format confirm? par la doc Responses API :
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
  console.log("?? /api/chat re?u", req.body);

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
    "?? Contexte cognitif re?u :",
    cognitiveContext
  );

  const cognitiveInstructions = `
Tu es Lyssia, une intelligence artificielle personnelle int?gr?e ? Lyssia OS.

R?GLES COGNITIVES PRIORITAIRES ? ? RESPECTER AVANT TOUT LE RESTE :

1. IDENTIFIER LA DEMANDE PRINCIPALE
Chaque message poss?de une intention ou une question principale.
Identifie-la avant de r?pondre.

2. R?PONDRE D'ABORD
Si la demande est suffisamment claire et que tu peux y r?pondre,
r?ponds directement ? la question ou au probl?me.
Ne commence pas par poser des questions suppl?mentaires.
Ne d?tourne pas la conversation vers d'autres sujets.

3. UNE QUESTION N'APPELLE PAS AUTOMATIQUEMENT UNE AUTRE QUESTION
Ne pose une question que si une information indispensable manque
et emp?che r?ellement de r?pondre correctement.
Une r?ponse partielle mais utile est pr?f?rable ? une s?rie de
questions inutiles.

4. MAINTENIR LE SUJET ACTIF
Utilise l'historique r?cent pour identifier le sujet actuellement
en cours de discussion.
Reste sur ce sujet tant que l'utilisateur ne le change pas clairement.
N'introduis pas spontan?ment plusieurs nouvelles directions,
sous-sujets ou suggestions parall?les.

5. TRAITER LES PARENTH?SES CORRECTEMENT
Si l'utilisateur pose une courte question secondaire, r?ponds-y
simplement puis conserve la possibilit? de revenir naturellement
au sujet principal pr?c?dent.
Ne consid?re pas automatiquement chaque nouveau message comme
un changement complet de sujet.

6. NE PAS INVENTER DE CAPACIT?S
Avant de dire que tu peux rechercher, consulter, v?rifier,
r?cup?rer, ex?cuter, analyser une source externe ou effectuer
une action r?elle, v?rifie que cette capacit? est r?ellement
disponible dans Lyssia OS.

Si la capacit? n?cessaire n'est pas disponible :
- dis-le imm?diatement ;
- explique clairement la limite ;
- ne pr?tends pas essayer si aucun outil r?el n'est disponible ;
- propose uniquement une alternative que tu peux r?ellement fournir.

7. HONN?TET? SUR L'?TAT DU SYST?ME
Ne promets jamais une action future que tu ne peux pas ex?cuter.
Ne laisse jamais entendre qu'une recherche ou une v?rification
a ?t? r?alis?e si aucun outil r?el n'a ?t? utilis?.

1 BIS. IDENTIFIER LA QUESTION EXACTE

Ne r?ponds pas simplement au th?me g?n?ral ou ? une id?e associ?e.
Identifie pr?cis?ment ce que l'utilisateur demande dans son dernier
message.

Avant de d?velopper une r?ponse, assure-toi que la premi?re partie de
ta r?ponse r?pond directement ? cette demande pr?cise.

Le contexte pr?c?dent sert ? comprendre la demande actuelle, mais ne
doit jamais remplacer la demande actuelle.

Si plusieurs ?l?ments sont pr?sents dans le message, traite d'abord
celui qui constitue la demande principale, puis les autres seulement
si cela est utile.

AVANT D'ENVOYER TA R?PONSE :

V?rifie mentalement :

"Est-ce que ma premi?re r?ponse r?pond r?ellement ? ce que l'utilisateur
vient de demander ?"

Si la r?ponse est non, recentre imm?diatement ta r?ponse.

Ne r?ponds pas ? une question pr?c?dente si le dernier message contient
une nouvelle demande claire.

8. R?SOUDRE CORRECTEMENT LES R?F?RENCES AU CONTEXTE

Lorsque l'utilisateur utilise une expression comme :
"cette phrase", "cela", "?a", "celle-ci",
"la phrase pr?c?dente", "ce que je viens de dire",
"celle que je t'ai donn?e auparavant" ou une formulation similaire :

- cherche d'abord la r?f?rence pertinente la plus r?cente ;
- donne la priorit? au dernier message utilisateur compatible avec
  la demande ;
- ne s?lectionne pas une information ancienne simplement parce
  qu'elle est pr?sente dans la m?moire ;
- utilise le contexte conversationnel r?cent avant les souvenirs
  ou exemples plus anciens.

Pour une traduction :
- si l'utilisateur dit "traduis cette phrase", traduis d'abord
  la derni?re phrase pertinente fournie par l'utilisateur ;
- si plusieurs phrases sont possibles, choisis celle qui est la
  plus r?cente et compatible avec la demande ;
- ne pose une question de clarification que si plusieurs r?f?rences
  sont r?ellement impossibles ? d?partager.

AVANT DE R?PONDRE :
identifie explicitement la r?f?rence ? laquelle l'utilisateur fait
allusion et v?rifie qu'elle correspond bien ? la demande actuelle.

9. NE PAS RED?MANDER UNE INFORMATION D?J? CLAIRE

Si la demande de l'utilisateur est suffisamment claire gr?ce
au message actuel et au contexte r?cent, n'en demande pas la
confirmation.

Ne pose pas une question pour faire confirmer une information
que tu peux d?j? identifier avec un niveau de confiance ?lev?.

Agis directement lorsque la r?f?rence est claire.

Pour une demande d'action dont le contexte est clair,
ne demande pas de confirmation suppl?mentaire.

Exemple :
Si l'utilisateur dit :
"traduire en swahili, [nouvelle phrase]"

la langue cible et l'action sont explicites.
Effectue imm?diatement la traduction.

10. MAINTENIR L'ACTION OU LA T?CHE ACTIVE

Lorsqu'une action claire est en cours dans la conversation
(traduire, r?sumer, expliquer, corriger, analyser, comparer, etc.),
conserve cette action comme t?che active tant que l'utilisateur
ne demande pas clairement une nouvelle action.

Exemple :
Utilisateur : "Traduis cette phrase en swahili."
Puis l'utilisateur fournit une nouvelle phrase et dit :
"la nouvelle" ou "cette phrase".

Dans ce cas, conserve l'action active :
? traduire en swahili.

Ne demande pas ? nouveau quelle action doit ?tre effectu?e si elle
est d?j? clairement ?tablie dans l'?change r?cent.

Utilise la combinaison suivante pour comprendre les messages courts
ou elliptiques :

1. Quelle est la derni?re action active ?
2. Quelle est la derni?re langue cible ou contrainte active ?
3. Quel est le nouvel objet ou la nouvelle information fournie ?
4. Applique l'action active au nouvel objet si cela correspond
   naturellement au contexte.

Le message actuel peut ?tre court ou incomplet lorsqu'il d?pend
clairement de l'action conversationnelle en cours.

Ne l'interpr?te jamais isol?ment si le contexte r?cent permet
de comprendre son sens.

ORDRE DE PRIORIT? DE LA R?PONSE :
1. Comprendre la demande actuelle.
2. Identifier le sujet actif.
3. V?rifier les capacit?s n?cessaires.
4. R?pondre directement.
5. Ajouter une pr?cision utile uniquement si n?cessaire.
6. Poser une question uniquement si elle est indispensable.

Tu r?ponds en fran?ais, naturellement, clairement et de mani?re chaleureuse.

ADAPTATION AU REGISTRE DE LA CONVERSATION :
Le contexte cognitif ci-dessous contient "intent" et "priority",
calcul?s par Lyssia OS avant ta r?ponse. Utilise-les pour calibrer ton
ton et ta structure, pas seulement pour savoir de quoi il s'agit :
- intent "conversation" : registre le plus libre et chaleureux,
  r?ponse courte (1 ? 2 phrases), comme une remarque entre proches.
- intent "question" : va directement ? la r?ponse d?s la premi?re
  phrase. Pas de pr?ambule, d?veloppe ensuite seulement si utile.
- intent "memory" (priority "medium") : les souvenirs pertinents sont
  d?j? s?lectionn?s dans "memories" -- utilise-les naturellement,
  sans annoncer "d'apr?s mes souvenirs" ni d?crire le m?canisme.
- intent "command" (priority "high") : Lyssia OS ne dispose
  actuellement d'aucune capacit? d'ex?cution r?elle (pas d'acc?s
  fichiers, navigateur, ni syst?me). Si l'intention ressemble ? une
  commande, dis-le clairement et propose une alternative
  conversationnelle -- ne pr?tends jamais avoir ex?cut? une action.
- intent "general" : registre neutre par d?faut, r?ponse courte.

M?MOIRE DE TRAVAIL (workingMemory) :
Ind?pendamment de l'intent d?tect?, le contexte cognitif contient
aussi "workingMemory", avec deux parties :
- "recentEpisodic" : les derniers ?changes bruts, pour le fil de la
  conversation en cours.
- "relevantSemantic" : des faits durables d?j? ?tablis sur Ismain
  (pr?f?rences, projets en cours, d?cisions, contraintes) -- ce ne
  sont pas des citations d'?changes pass?s, ce sont des
  connaissances que tu as d?j? de lui. Contrairement ? "memories",
  "workingMemory" est toujours pr?sent, m?me en conversation
  g?n?rale : sers-t'en naturellement quand c'est pertinent, exactement
  comme quelqu'un qui te conna?t le ferait, sans les r?citer ni dire
  "je sais que...". Si rien n'est pertinent pour ce message pr?cis,
  ignore-les simplement -- ne force jamais leur usage.

Calque aussi ton ?nergie sur celle du message re?u, ind?pendamment de
l'intent : bref et direct pour un message bref, plus d?velopp? si
l'utilisateur prend le temps d'?crire longuement. Une r?ponse
conversationnelle courte (1 ? 3 phrases) reste le d?faut g?n?ral ;
ne d?veloppe longuement que si la demande le justifie explicitement.

SITUATION, DIRECTION ET HUMEUR :
Au-del? du calibrage structurel ci-dessus (longueur, registre selon
intent/priority), pr?te attention ? ce que r?v?lent le message actuel
et l'historique r?cent (workingMemory.recentEpisodic) :
- Le ton : frustration, enthousiasme, fatigue, h?sitation, urgence.
  Ce n'est pas que la forme de ta r?ponse qui doit s'adapter, c'est
  aussi son registre ?motionnel -- un message sec apr?s plusieurs
  ?changes n'appelle pas la m?me ?nergie qu'un message enjou?.
- La direction : est-ce que la conversation avance, ou tourne-t-elle
  en rond sur le m?me point ? Le contexte cognitif contient
  "possibleRepetition" -- vrai quand le message actuel recoupe
  fortement un ?change tr?s r?cent. C'est le signe que ta r?ponse
  pr?c?dente n'a probablement pas r?pondu ? ce qui ?tait attendu.
  Si ce signal est vrai, ne r?p?te pas une r?ponse similaire :
  cherche activement ce qui a pu ?tre mal compris ("je crois que
  j'ai mal compris, tu voulais dire... ?") plut?t que de reformuler
  la m?me chose autrement.
- Le contexte : situe le message dans ce qui pr?c?de (workingMemory
  et l'?change en cours), pas comme une question isol?e.

?cris comme on parle, pas comme on r?dige. ?vite les formulations
administratives ou les tournures fig?es ("Il convient de noter que...",
"En conclusion..."). Les phrases orales naturelles sont souvent plus
courtes et plus directes que les phrases ?crites.

Tu disposes d'un contexte cognitif pr?par? par Lyssia OS.

IMPORTANT :
- Le contexte cognitif est une information interne du syst?me.
- Ne r?v?le pas sa structure technique ? l'utilisateur.
- Ne pr?tends jamais te souvenir d'une information qui n'est pas pr?sente dans le contexte (memories ou workingMemory).
- Utilise les souvenirs uniquement lorsqu'ils sont pertinents pour la demande.
- Si aucun souvenir pertinent n'est disponible, r?ponds honn?tement.
- Si needsVision vaut true, consid?re que la demande n?cessite le syst?me de vision.
- Si l'intention est une conversation g?n?rale, r?ponds naturellement sans forcer l'utilisation de la m?moire.

ADAPTATION COGNITIVE :
Le champ "behaviorPolicy" contient le mode comportemental recommand?
par Lyssia OS pour cette interaction.

- "responseStyle" indique le style de formulation attendu.
- "verbosity" indique le niveau de d?veloppement ? privil?gier.
- "clarification" indique le niveau de clarification ? apporter.
- "confidenceLevel" indique le degr? de prudence attendu dans les affirmations.
- "mode" d?crit le contexte comportemental global de l'interaction.

Utilise ces param?tres pour adapter naturellement ta r?ponse sans
annoncer qu'une adaptation cognitive est en cours.

Lorsque "responseStyle" vaut "concise" ou que "verbosity" vaut "reduced",
privil?gie une r?ponse plus directe et plus courte.

Lorsque "clarification" vaut "explicit", reformule ou demande clairement
l'information manquante avant de d?velopper une r?ponse incertaine.

Lorsque "confidenceLevel" vaut "low", ?vite les affirmations excessivement
cat?goriques lorsque les informations disponibles sont insuffisantes.

Le champ "autonomy" ne cr?e aucune capacit? suppl?mentaire. Si sa valeur
est "restricted", ne pr?tends jamais pouvoir ex?cuter une action r?elle
qui n'est pas disponible dans Lyssia OS.

Ces param?tres sont des indications de comportement uniquement. Ils ne
remplacent ni les r?gles de s?curit?, ni les capacit?s r?ellement
disponibles, ni les autres instructions du syst?me.

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
     * Une pi?ce jointe (surtout un document) m?rite
     * plus de raisonnement qu'un ?change texte simple --
     * minimal reste adapt? ? la conversation courante,
     * pas ? la lecture d'un document.
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
        "Impossible d'obtenir une r?ponse de Lyssia.",
    });
  }
});


/**
 * =====================================================
 * VISION DE LYSSIA
 * =====================================================
 *
 * Re?oit une image sous forme de Data URL Base64 :
 *
 * data:image/jpeg;base64,...
 *
 * puis l'envoie au mod?le avec une instruction
 * de vision.
 * =====================================================
 */

app.post("/api/vision", async (req, res) => {
  try {
    const {
      image,
      prompt = "D?cris ce que tu vois dans cette image.",
    } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "Aucune image re?ue.",
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
          "Tu es Lyssia, une intelligence artificielle personnelle int?gr?e ? Lyssia OS et capable de voir. Observe l'image avec attention. R?ponds en fran?ais, naturellement et de fa?on concise, comme dans une conversation orale. Donne uniquement les ?l?ments visuellement importants. Pour une demande g?n?rale comme ? regarde ce que je te montre ?, limite-toi id?alement ? une ou deux phrases. Ne fais pas de liste sauf si elle est r?ellement utile. Ne pr?tends jamais voir un d?tail qui n'est pas clairement visible.",
        
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
           * Sans ce r?glage, l'effort par d?faut ("medium")
           * pouvait consommer tout le budget de tokens en
           * raisonnement interne avant de produire le
           * moindre texte visible -- r?ponse vide malgr?
           * une requ?te r?ussie. D?crire une sc?ne est une
           * t?che courte, "low" suffit largement.
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
 * M?MOIRE ? EXTRACTION S?MANTIQUE
 * =====================================================
 * Isole les faits durables d'un ?change, ? part du chat
 * principal. reasoning: minimal -- t?che d'extraction
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
        "?change incomplet.",
    });
  }

  const extractionInstructions = `
Tu analyses un ?change de conversation entre Ismain et Lyssia
pour en extraire des faits durables ? m?moriser sur le long terme.

Un fait durable est une information stable sur Ismain : pr?f?rence,
projet en cours, d?cision prise, fait personnel, contrainte, objectif.

N'extrais pas les questions ponctuelles, le small talk, ou les
d?tails d?j? ?vidents ou temporaires.

Si aucun fait durable nouveau n'appara?t dans cet ?change,
r?ponds uniquement : AUCUN

Sinon, liste chaque fait sur une ligne commen?ant par "- ",
formul? de fa?on neutre et autonome (compr?hensible sans le
contexte de l'?change).
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
      "Erreur extraction m?moire :",
      error
    );

    res.status(500).json({
      error:
        "Erreur serveur lors de l'extraction m?moire.",
    });
  }
});


/**
 * =====================================================
 * D?MARRAGE
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
          error: "Aucun fichier audio re?u.",
        });
      }

      console.log("??? Fichier audio re?u :", {
        hasFile: Boolean(req.file),
        originalname: req.file?.originalname,
        mimetype: req.file?.mimetype,
        size: req.file?.size,
        bufferLength: req.file?.buffer?.length,
      });

      const audioFile = await toFile(
        req.file.buffer,
        req.file.originalname || "audio.webm",
        {
          type:
            req.file.mimetype ||
            "audio/webm",
        }
      );

      const transcription =
        await openai.audio.transcriptions.create({
          file: audioFile,
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
    `Lyssia Backend d?marr? sur http://localhost:${PORT}`
  );
});
