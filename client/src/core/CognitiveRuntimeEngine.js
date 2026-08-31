import {
  calculateCognitiveScore,
} from "./CognitiveScoreEngine.js";

import {
  evaluateCognitivePerformance,
} from "./CognitivePerformanceEngine.js";

import {
  calculateCognitiveComposite,
} from "./CognitiveCompositeEngine.js";

import {
  addCognitiveScore,
  createCognitiveHistory,
} from "./CognitiveHistoryEngine.js";

import {
  createCognitiveState,
} from "./CognitiveStateEngine.js";

/**
 * ============================================================
 * LYSSIA OS
 * Cognitive Runtime Engine V1
 * ============================================================
 *
 * Orchestre l'évaluation cognitive complète d'une interaction.
 *
 * Ce moteur ne remplace pas le CognitiveEngine existant.
 * Il évalue a posteriori le traitement réellement produit
 * par Lyssia et construit un état cognitif exploitable
 * par le reste du système.
 *
 * Chaîne :
 *
 * interaction
 *    ↓
 * CognitiveScoreEngine
 *    ↓
 * CognitivePerformanceEngine
 *    ↓
 * CognitiveCompositeEngine
 *    ↓
 * CognitiveHistoryEngine
 *    ↓
 * CognitiveStateEngine
 *
 * ============================================================
 */

export function evaluateCognitiveInteraction({
  message = "",
  reply = "",
  cognitivePlan = null,
  cognition = null,
  workingMemory = null,
  memories = [],
  capabilities = {},
  history = [],
} = {}) {
  /*
   * ------------------------------------------------------------
   * 1. SCORE COGNITIF STRUCTUREL
   * ------------------------------------------------------------
   */

  const cognitiveResult =
    calculateCognitiveScore({
      message,
      cognitivePlan,
      cognition,
      workingMemory,
      memories,
      capabilities,
    });

  /*
   * ------------------------------------------------------------
   * 2. PERFORMANCE DÉMONTRÉE
   * ------------------------------------------------------------
   */

  const performanceResult =
    evaluateCognitivePerformance({
      message,
      reply,
      cognitivePlan,
      cognition,
      workingMemory,
    });

  /*
   * ------------------------------------------------------------
   * 3. SCORE COMPOSITE
   * ------------------------------------------------------------
   */

  const compositeResult =
    calculateCognitiveComposite({
      cognitiveResult,
      performanceResult,
      cognitivePlan,
    });

  /*
   * ------------------------------------------------------------
   * 4. HISTORIQUE
   * ------------------------------------------------------------
   *
   * L'historique reçu en entrée reste immuable.
   * Une nouvelle observation est ajoutée pour cette interaction.
   */

  const nextHistory =
    addCognitiveScore(
      history,
      {
        score:
          compositeResult.compositeScore,

        source:
          "interaction",
      }
    );

  const historyResult =
    createCognitiveHistory(
      nextHistory
    );

  /*
   * ------------------------------------------------------------
   * 5. ÉTAT COGNITIF FINAL
   * ------------------------------------------------------------
   */

  const state =
    createCognitiveState({
      cognitiveResult,
      performanceResult,
      compositeResult,
      historySummary:
        historyResult.summary,
      capabilities,
    });

  return {
    cognitiveResult,
    performanceResult,
    compositeResult,

    history:
      nextHistory,

    historyResult,

    state,

    timestamp:
      new Date().toISOString(),
  };
}

export default {
  evaluateCognitiveInteraction,
};