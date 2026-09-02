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

import {
  evaluateCognitiveOperationalIndex,
} from "./CognitiveOperationalIndexEngine.js";

import {
  deriveOperationalSignals,
} from "./CognitiveOperationalSignalsEngine.js";

import {
  evaluateCognitiveAdaptation,
  suggestCognitiveExperiment,
} from "./CognitiveAdaptationEngine.js";

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
  behaviorPolicy = null,
  cognitiveState = null,
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
   * 4. INDICE OPÉRATIONNEL
   * ------------------------------------------------------------
   *
   * Intégration initiale volontairement neutre :
   * le score cognitif constitue la base de l'indice.
   * Les bonus seront alimentés ultérieurement par
   * des signaux réels provenant de l'architecture.
   */

  const operationalSignals =
    deriveOperationalSignals({
      cognitiveResult,
      performanceResult,
      cognitivePlan,
      cognition,
      workingMemory,
      memories,
      capabilities,
      behaviorPolicy,
      cognitiveState,
    });

  const operationalIndexResult =
    evaluateCognitiveOperationalIndex({
      cognitiveScore:
        compositeResult.compositeScore,

      integration:
        operationalSignals.integration.score,

      capabilities:
        operationalSignals.capabilities.score,

      adaptation:
        operationalSignals.adaptation.score,

      reliability:
        operationalSignals.reliability.score,
    });

  /*
   * ------------------------------------------------------------
   * 5. HISTORIQUE
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

        operationalIndex:
          operationalIndexResult.operationalIndex,

        operationalComponents:
          operationalIndexResult.components,

        operationalEvidence:
          operationalSignals.evidence,
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

  const adaptationResult =
    evaluateCognitiveAdaptation({
      history: nextHistory,
      cognitiveState: state,
    });

  const experimentProposal =
    suggestCognitiveExperiment({
      history: nextHistory,
      cognitiveState: state,
    });

  console.log(
    "[Lyssia Adaptation] observation:",
    adaptationResult
  );

  console.log(
    "[Lyssia Adaptation] experiment proposal:",
    experimentProposal
  );

  return {
    cognitiveResult,
    performanceResult,
    compositeResult,

    operationalIndex:
      operationalIndexResult,

    adaptation: {
      ...adaptationResult,

      experimentProposal,
    },

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