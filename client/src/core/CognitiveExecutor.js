/**
 * ============================================================
 * LYSSIA — COGNITIVE EXECUTOR V1
 * ============================================================
 *
 * Exécute les décisions produites par CognitiveEngine V2.
 *
 * Le moteur cognitif décide.
 * L'exécuteur applique la décision.
 * ============================================================
 */

import {
  COGNITIVE_ROUTES,
  COGNITIVE_ACTIONS,
  isValidCognitivePlan,
} from "./CognitiveEngine.v2.js";

/*
 * ============================================================
 * EXÉCUTION DU PLAN
 * ============================================================
 */

export function executeCognitivePlan(
  plan,
  handlers = {}
) {
  if (!isValidCognitivePlan(plan)) {
    throw new Error(
      "Impossible d'exécuter un plan cognitif invalide."
    );
  }

  const {
    onChat,
    onMemory,
    onVision,
    onCommand,
    onStop,
  } = handlers;

  /*
   * ----------------------------------------------------------
   * ARRÊT
   * ----------------------------------------------------------
   */

  if (
    plan.action ===
    COGNITIVE_ACTIONS.STOP
  ) {
    if (typeof onStop === "function") {
      return onStop(plan);
    }

    return {
      executed: false,
      route: plan.route,
      action: plan.action,
      reason: "no_stop_handler",
    };
  }

  /*
   * ----------------------------------------------------------
   * CHAT
   * ----------------------------------------------------------
   */

  if (
    plan.route ===
    COGNITIVE_ROUTES.CHAT
  ) {
    if (typeof onChat === "function") {
      return onChat(plan);
    }

    return {
      executed: false,
      route: plan.route,
      action: plan.action,
      reason: "no_chat_handler",
    };
  }

  /*
   * ----------------------------------------------------------
   * MÉMOIRE
   * ----------------------------------------------------------
   */

  if (
    plan.route ===
    COGNITIVE_ROUTES.MEMORY
  ) {
    if (typeof onMemory === "function") {
      return onMemory(plan);
    }

    return {
      executed: false,
      route: plan.route,
      action: plan.action,
      reason: "no_memory_handler",
    };
  }

  /*
   * ----------------------------------------------------------
   * VISION
   * ----------------------------------------------------------
   */

  if (
    plan.route ===
    COGNITIVE_ROUTES.VISION
  ) {
    if (typeof onVision === "function") {
      return onVision(plan);
    }

    return {
      executed: false,
      route: plan.route,
      action: plan.action,
      reason: "no_vision_handler",
    };
  }

  /*
   * ----------------------------------------------------------
   * COMMANDES
   * ----------------------------------------------------------
   */

  if (
    plan.route ===
    COGNITIVE_ROUTES.COMMAND
  ) {
    if (typeof onCommand === "function") {
      return onCommand(plan);
    }

    return {
      executed: false,
      route: plan.route,
      action: plan.action,
      reason: "no_command_handler",
    };
  }

  throw new Error(
    `Route cognitive non gérée : ${plan.route}`
  );
}

export default {
  executeCognitivePlan,
};
