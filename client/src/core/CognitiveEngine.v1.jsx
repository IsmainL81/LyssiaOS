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
 * - préparer une structure cognitive exploitable ;
 *
 * IMPORTANT :
 * Cette V1 n'appelle aucune IA externe.
 * Elle ne remplace pas encore ChatPanel.
 * Elle constitue le socle du futur raisonnement de Lyssia.
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
    .replace(/[\u0300-\u036f]/g, "");
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
    normalized.includes("rappel")
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

function analyzeMessage(text = "") {
  const normalizedText = normalizeText(text);
  const intent = detectIntent(text);

  const {
    needsMemory,
    needsVision,
  } = detectNeeds(text, intent);

  return {
    input: String(text),
    normalizedText,

    intent,

    needsMemory,
    needsVision,

    priority: detectPriority(intent),

    context: {
      currentMessage: String(text),
      intent,
      needsMemory,
      needsVision,
    },

    timestamp: new Date().toISOString(),
  };
}

export {
  INTENTS,
  analyzeMessage,
  detectIntent,
  detectNeeds,
  normalizeText,
};

export default {
  INTENTS,
  analyzeMessage,
  detectIntent,
  detectNeeds,
  normalizeText,
};