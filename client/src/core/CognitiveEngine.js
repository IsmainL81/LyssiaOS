/**
 * ============================================================
 * LYSSIA — COGNITIVE ENGINE V1
 * ============================================================
 *
 * Première couche cognitive de Lyssia.
 *
 * Rôle :
 * - analyser le message humain ;
 * - déterminer l'intention générale ;
 * - détecter les besoins mémoire / vision ;
 * - sélectionner les souvenirs pertinents ;
 * - préparer une structure cognitive exploitable.
 *
 * IMPORTANT :
 * Cette V1 ne remplace pas encore le raisonnement du LLM.
 * ============================================================
 */

const INTENTS = {
  GENERAL: "general",
  MEMORY: "memory",
  VISION: "vision",
  QUESTION: "question",
  COMMAND: "command",
  CONVERSATION: "conversation",
};

function normalizeText(text = "") {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´]/g, "'")
    .replace(/[^\p{L}\p{N}'\s?]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text = "") {
  return normalizeText(text)
    .replace(/[?]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 3
    );
}

function detectIntent(text) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return INTENTS.GENERAL;
  }

  if (
    
  normalized.includes("souvenir") ||
  normalized.includes("souviens") ||
  normalized.includes("memoire") ||
  normalized.includes("rappelle") ||
  normalized.includes("rappel") ||
  normalized.includes("qu'avons nous decide") ||
  normalized.includes("qu'avions nous decide") ||
  normalized.includes("qu'est-ce qu'on avait decide") ||
  normalized.includes("ce qu'on avait decide") ||
  normalized.includes("ce qu'on avait prevu") ||
  normalized.includes("ce qu'on avait choisi")

  ) {
    return INTENTS.MEMORY;
  }

  if (
    normalized.includes("vois") ||
    normalized.includes("regarde") ||
    normalized.includes("image") ||
    normalized.includes("photo") ||
    normalized.includes("camera") ||
    normalized.includes("vision")
  ) {
    return INTENTS.VISION;
  }

  if (
    normalized.startsWith("pourquoi") ||
    normalized.startsWith("comment") ||
    normalized.startsWith("qu'est-ce") ||
    normalized.startsWith("quel") ||
    normalized.startsWith("quelle") ||
    normalized.startsWith("quels") ||
    normalized.startsWith("quelles") ||
    normalized.includes("?")
  ) {
    return INTENTS.QUESTION;
  }

  if (
    normalized.startsWith("fais ") ||
    normalized.startsWith("fait ") ||
    normalized.startsWith("cree ") ||
    normalized.startsWith("creer ") ||
    normalized.startsWith("ouvre ") ||
    normalized.startsWith("lance ") ||
    normalized.startsWith("arrete ") ||
    normalized.startsWith("supprime ")
  ) {
    return INTENTS.COMMAND;
  }

  return INTENTS.CONVERSATION;
}

function detectNeeds(text, intent) {
  const normalized = normalizeText(text);

  const needsMemory =
    intent === INTENTS.MEMORY ||
    normalized.includes("avant") ||
    normalized.includes("dernierement") ||
    normalized.includes("la derniere fois") ||
    normalized.includes("tu te souviens") ||
    normalized.includes("tu sais que");

  const needsVision =
    intent === INTENTS.VISION ||
    normalized.includes("regarde") ||
    normalized.includes("qu'est-ce que tu vois");

  return {
    needsMemory,
    needsVision,
  };
}

function detectPriority(intent) {
  if (intent === INTENTS.COMMAND) {
    return "high";
  }

  if (
    intent === INTENTS.MEMORY ||
    intent === INTENTS.VISION
  ) {
    return "medium";
  }

  return "normal";
}

/**
 * ============================================================
 * SCORE DE PERTINENCE MÉMOIRE
 * ============================================================
 */

function scoreMemory(
  memory,
  queryTokens,
  intent
) {
  if (!memory) {
    return 0;
  }

  const contentTokens =
    tokenize(memory.content);

  if (contentTokens.length === 0) {
    return 0;
  }

  let score = 0;

  // Correspondance lexicale
  const matches =
    queryTokens.filter((token) =>
      contentTokens.includes(token)
    );

  score +=
    matches.length * 10;

  // Bonus si plusieurs mots correspondent
  if (matches.length >= 2) {
    score += 10;
  }

  // Cohérence avec l'intention
  if (
    intent === INTENTS.MEMORY &&
    memory.type === "conversation"
  ) {
    score += 15;
  }

  if (
    intent === INTENTS.VISION &&
    memory.type === "vision"
  ) {
    score += 15;
  }

  // Importance
  if (memory.importance === "high") {
    score += 10;
  }

  if (memory.importance === "medium") {
    score += 5;
  }

  // Récence
  if (memory.createdAt) {
    const created =
      new Date(
        memory.createdAt
      ).getTime();

    if (!Number.isNaN(created)) {
      const age =
        Date.now() - created;

      const day =
        24 * 60 * 60 * 1000;

      if (age < day) {
        score += 8;
      } else if (age < day * 7) {
        score += 5;
      } else if (
        age <
        day * 30
      ) {
        score += 2;
      }
    }
  }

  return score;
}

/**
 * ============================================================
 * SÉLECTION DES SOUVENIRS PERTINENTS
 * ============================================================
 */

function selectRelevantMemories({
  message = "",
  memories = [],
  intent = INTENTS.GENERAL,
  limit = 5,
} = {}) {
  if (
    !Array.isArray(memories) ||
    memories.length === 0
  ) {
    return [];
  }

  const queryTokens =
    tokenize(message);

  if (queryTokens.length === 0) {
    return memories.slice(
      0,
      limit
    );
  }

  return memories
    .map((memory) => ({
      memory,
      score: scoreMemory(
        memory,
        queryTokens,
        intent
      ),
    }))
    .filter(
      ({ score }) =>
        score > 0
    )
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, limit)
    .map(
      ({ memory, score }) => ({
        ...memory,
        cognitiveScore: score,
      })
    );
}

/**
 * ============================================================
 * PRÉPARATION DU CONTEXTE COGNITIF
 * ============================================================
 */

function prepareCognitiveContext({
  message = "",
  cognition = null,
  memories = [],
  limit = 5,
} = {}) {
  const analysis =
    cognition ||
    analyzeMessage(
      message,
      memories
    );

  const relevantMemories =
    analysis.relevantMemories ||
    selectRelevantMemories({
      message,
      memories,
      intent: analysis.intent,
      limit,
    });

  return {
    message,
    intent:
      analysis.intent,
    priority:
      analysis.priority,
    needsMemory:
      analysis.needsMemory,
    needsVision:
      analysis.needsVision,
    possibleRepetition:
      analysis.possibleRepetition ||
      false,

    memories:
      relevantMemories.map(
        (memory) => ({
          id: memory.id,
          type: memory.type,
          content: memory.content,
          importance:
            memory.importance,
          createdAt:
            memory.createdAt,
          cognitiveScore:
            memory.cognitiveScore || 0,
        })
      ),
  };
}



/**
 * ============================================================
 * DÉTECTION DE RÉPÉTITION
 * ============================================================
 * Signal calculable, pas seulement espéré du modèle : si le
 * message actuel recoupe fortement un échange très récent,
 * c'est probablement qu'Ismain reformule -- signe que la
 * réponse précédente n'a pas répondu à ce qu'il attendait.
 */

function detectRepetition(
  text,
  memories = [],
  { withinCount = 3 } = {}
) {
  const currentTokens =
    new Set(tokenize(text));

  if (currentTokens.size === 0) {
    return false;
  }

  const recentConversations =
    memories
      .filter(
        (memory) =>
          memory.type === "conversation"
      )
      .slice(0, withinCount);

  return recentConversations.some(
    (memory) => {
      const memoryTokens =
        tokenize(memory.content);

      const overlap =
        memoryTokens.filter((token) =>
          currentTokens.has(token)
        );

      return (
        overlap.length >=
        Math.min(
          3,
          currentTokens.size
        )
      );
    }
  );
}

/**
 * ============================================================
 * ANALYSE COGNITIVE
 * ============================================================
 */

function analyzeMessage(
  text = "",
  memories = []
) {
  const normalizedText =
    normalizeText(text);

  const intent =
    detectIntent(text);

  const {
    needsMemory,
    needsVision,
  } = detectNeeds(
    text,
    intent
  );

  const relevantMemories =
    needsMemory
      ? selectRelevantMemories({
          message: text,
          memories,
          intent,
        })
      : [];

  const possibleRepetition =
    detectRepetition(
      text,
      memories
    );

  return {
    input: String(text),

    normalizedText,

    intent,

    needsMemory,

    needsVision,

    possibleRepetition,

    priority:
      detectPriority(intent),

    relevantMemories,

    context: {
      currentMessage:
        String(text),

      intent,

      needsMemory,

      needsVision,

      possibleRepetition,

      relevantMemories,
    },

    timestamp:
      new Date().toISOString(),
  };
}

export {
  INTENTS,
  normalizeText,
  tokenize,
  detectIntent,
  detectNeeds,
  detectPriority,
  scoreMemory,
  selectRelevantMemories,
  detectRepetition,
  prepareCognitiveContext,
  analyzeMessage,
};

export default {
  INTENTS,
  normalizeText,
  tokenize,
  detectIntent,
  detectNeeds,
  detectPriority,
  scoreMemory,
  selectRelevantMemories,
  detectRepetition,
  prepareCognitiveContext,
  analyzeMessage,
};