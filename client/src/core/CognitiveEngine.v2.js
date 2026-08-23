/**
 * ============================================================
 * LYSSIA — COGNITIVE ENGINE V2
 * ============================================================
 */

import {
  INTENTS,
  analyzeMessage,
  selectRelevantMemories,
} from "./CognitiveEngine.js";

/*
 * ============================================================
 * ROUTES
 * ============================================================
 */

export const COGNITIVE_ROUTES = {
  CHAT: "chat",
  MEMORY: "memory",
  VISION: "vision",
  COMMAND: "command",
};

/*
 * ============================================================
 * ACTIONS
 * ============================================================
 */

export const COGNITIVE_ACTIONS = {
  RESPOND: "respond",
  RECALL: "recall",
  OBSERVE: "observe",
  EXECUTE: "execute",
  STOP: "stop",
};

/*
 * ============================================================
 * DÉTECTION D'ARRÊT
 * ============================================================
 */

function isStopRequest(message = "") {
  const normalized =
    String(message)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const stopPatterns = [
    "arrete",
    "arreter",
    "stop",
    "desactive",
    "desactiver",
    "coupe",
    "couper",
    "termine",
    "terminer",
  ];

  return stopPatterns.some(
    (pattern) =>
      normalized === pattern ||
      normalized.startsWith(
        `${pattern} `
      ) ||
      normalized.includes(
        ` ${pattern} `
      )
  );
}

/*
 * ============================================================
 * DÉTECTION D'ACTION DE VISION
 * ============================================================
 */

function isVisionActionRequest(
  message = ""
) {
  const normalized =
    String(message)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  return (
    normalized.includes("vision") ||
    normalized.includes("camera") ||
    normalized.includes("observation")
  );
}

/*
 * ============================================================
 * DÉTERMINATION DE LA ROUTE
 * ============================================================
 */

export function determineRoute({
  message = "",
  intent,
  needsMemory = false,
  needsVision = false,
} = {}) {
  /*
   * Une demande d'arrêt liée à la vision reste routée
   * vers le système Vision.
   */
  if (
    isStopRequest(message) &&
    isVisionActionRequest(message)
  ) {
    return COGNITIVE_ROUTES.VISION;
  }

  if (
    needsVision ||
    intent === INTENTS.VISION
  ) {
    return COGNITIVE_ROUTES.VISION;
  }

  if (
    intent === INTENTS.COMMAND
  ) {
    return COGNITIVE_ROUTES.COMMAND;
  }

  if (
    needsMemory ||
    intent === INTENTS.MEMORY
  ) {
    return COGNITIVE_ROUTES.MEMORY;
  }

  return COGNITIVE_ROUTES.CHAT;
}

/*
 * ============================================================
 * DÉTERMINATION DE L'ACTION
 * ============================================================
 */

export function determineAction({
  message = "",
  intent,
  needsMemory = false,
  needsVision = false,
} = {}) {
  /*
   * STOP est prioritaire.
   */
  if (
    isStopRequest(message)
  ) {
    return COGNITIVE_ACTIONS.STOP;
  }

  if (
    needsVision ||
    intent === INTENTS.VISION
  ) {
    return COGNITIVE_ACTIONS.OBSERVE;
  }

  if (
    intent === INTENTS.COMMAND
  ) {
    return COGNITIVE_ACTIONS.EXECUTE;
  }

  if (
    needsMemory ||
    intent === INTENTS.MEMORY
  ) {
    return COGNITIVE_ACTIONS.RECALL;
  }

  return COGNITIVE_ACTIONS.RESPOND;
}

/*
 * ============================================================
 * CONSTRUCTION DU PLAN COGNITIF
 * ============================================================
 */

export function createCognitivePlan({
  message = "",
  memories = [],
  limit = 5,
} = {}) {
  const cleanMessage =
    String(message || "").trim();

  if (!cleanMessage) {
    return {
      message: "",
      intent: INTENTS.GENERAL,
      priority: "normal",

      needsMemory: false,
      needsVision: false,

      memories: [],

      route: COGNITIVE_ROUTES.CHAT,
      action: COGNITIVE_ACTIONS.RESPOND,

      timestamp:
        new Date().toISOString(),
    };
  }

  /*
   * Analyse cognitive V1 réutilisée.
   */
  const analysis =
    analyzeMessage(
      cleanMessage,
      memories
    );

  const route =
    determineRoute({
      message: cleanMessage,
      intent: analysis.intent,
      needsMemory:
        analysis.needsMemory,
      needsVision:
        analysis.needsVision,
    });

  const action =
    determineAction({
      message: cleanMessage,
      intent: analysis.intent,
      needsMemory:
        analysis.needsMemory,
      needsVision:
        analysis.needsVision,
    });

  const relevantMemories =
    analysis.needsMemory
      ? selectRelevantMemories({
          message: cleanMessage,
          memories,
          intent: analysis.intent,
          limit,
        })
      : [];

  /*
   * Une commande STOP liée à la vision doit signaler
   * explicitement que la vision est concernée.
   */
  const finalNeedsVision =
    analysis.needsVision ||
    (
      action ===
        COGNITIVE_ACTIONS.STOP &&
      isVisionActionRequest(
        cleanMessage
      )
    );

  return {
    message: cleanMessage,

    intent:
      analysis.intent,

    priority:
      analysis.priority,

    needsMemory:
      analysis.needsMemory,

    needsVision:
      finalNeedsVision,

    memories:
      relevantMemories,

    route,

    action,

    timestamp:
      new Date().toISOString(),
  };
}

/*
 * ============================================================
 * VALIDATION
 * ============================================================
 */

export function isValidCognitivePlan(
  plan
) {
  if (!plan) {
    return false;
  }

  if (
    typeof plan.message !==
    "string"
  ) {
    return false;
  }

  if (
    !Object.values(
      COGNITIVE_ROUTES
    ).includes(plan.route)
  ) {
    return false;
  }

  if (
    !Object.values(
      COGNITIVE_ACTIONS
    ).includes(plan.action)
  ) {
    return false;
  }

  if (
    typeof plan.needsMemory !==
    "boolean"
  ) {
    return false;
  }

  if (
    typeof plan.needsVision !==
    "boolean"
  ) {
    return false;
  }

  if (
    !Array.isArray(plan.memories)
  ) {
    return false;
  }

  return true;
}

/*
 * ============================================================
 * ORCHESTRATEUR
 * ============================================================
 */

export function orchestrateCognition({
  message = "",
  memories = [],
  limit = 5,
} = {}) {
  const plan =
    createCognitivePlan({
      message,
      memories,
      limit,
    });

  if (
    !isValidCognitivePlan(plan)
  ) {
    throw new Error(
      "Le plan cognitif Lyssia est invalide."
    );
  }

  return plan;
}

export default {
  COGNITIVE_ROUTES,
  COGNITIVE_ACTIONS,
  determineRoute,
  determineAction,
  createCognitivePlan,
  isValidCognitivePlan,
  orchestrateCognition,
};

