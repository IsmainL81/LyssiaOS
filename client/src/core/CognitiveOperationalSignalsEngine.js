/**
 * ============================================================
 * LYSSIA OS
 * Cognitive Operational Signals Engine V1
 * ============================================================
 *
 * Transforme les capacités réellement observées pendant une
 * interaction en signaux exploitables par l'Operational Index.
 *
 * IMPORTANT :
 * - Aucun score humain.
 * - Aucun diagnostic médical.
 * - Aucun QI.
 * - Aucun bonus arbitraire.
 *
 * Les signaux sont dérivés uniquement des données déjà produites
 * par les moteurs cognitifs de Lyssia OS.
 *
 * ============================================================
 */

function clamp(value, min, max) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return min;
  }

  return Math.min(
    max,
    Math.max(min, numeric)
  );
}

function hasArrayItems(value) {
  return Array.isArray(value) && value.length > 0;
}

/**
 * ------------------------------------------------------------
 * INTÉGRATION
 * ------------------------------------------------------------
 *
 * Mesure la coordination effective de plusieurs briques.
 *
 * Maximum : 15
 */
export function deriveIntegrationSignal({
  cognitivePlan = null,
  cognition = null,
  workingMemory = null,
  memories = [],
  capabilities = {},
} = {}) {
  let score = 0;
  const evidence = [];

  if (cognition?.intent && cognitivePlan?.route) {
    score += 3;
    evidence.push(
      "intention et route cognitives coordonnées"
    );
  }

  if (cognitivePlan?.route && cognitivePlan?.action) {
    score += 3;
    evidence.push(
      "route et action coordonnées"
    );
  }

  if (
    hasArrayItems(
      workingMemory?.recentEpisodic
    ) ||
    hasArrayItems(
      workingMemory?.relevantSemantic
    )
  ) {
    score += 3;
    evidence.push(
      "mémoire de travail disponible"
    );
  }

  if (
    capabilities.memory &&
    (
      hasArrayItems(memories) ||
      hasArrayItems(
        workingMemory?.relevantSemantic
      )
    )
  ) {
    score += 3;
    evidence.push(
      "capacité mémoire effectivement intégrée"
    );
  }

  if (
    capabilities.vision &&
    cognition?.needsVision
  ) {
    score += 3;
    evidence.push(
      "perception visuelle intégrée à la demande"
    );
  }

  return {
    score: clamp(score, 0, 15),
    evidence,
  };
}

/**
 * ------------------------------------------------------------
 * CAPACITÉS
 * ------------------------------------------------------------
 *
 * Mesure les capacités effectivement disponibles ou mobilisées.
 *
 * Maximum : 20
 */
export function deriveCapabilitySignal({
  cognition = null,
  cognitivePlan = null,
  capabilities = {},
} = {}) {
  let score = 0;
  const evidence = [];

  if (
    capabilities.chat &&
    cognitivePlan?.route === "chat"
  ) {
    score += 2;
    evidence.push(
      "conversation opérationnelle"
    );
  }

  if (
    capabilities.memory &&
    cognition?.needsMemory
  ) {
    score += 4;
    evidence.push(
      "mémoire sollicitée"
    );
  }

  if (
    capabilities.vision &&
    cognition?.needsVision
  ) {
    score += 4;
    evidence.push(
      "vision sollicitée"
    );
  }

  if (
    cognitivePlan?.action &&
    (
      cognitivePlan.action === "execute" ||
      cognitivePlan.action === "respond"
    )
  ) {
    score += 4;
    evidence.push(
      "action cognitive disponible"
    );
  }

  if (
    cognition?.intent === "question" ||
    cognition?.intent === "conversation"
  ) {
    score += 4;
    evidence.push(
      "compréhension conversationnelle exploitée"
    );
  }

  if (capabilities.audio) {
    score += 2;
    evidence.push(
      "capacité audio disponible"
    );
  }

  return {
    score: clamp(score, 0, 20),
    evidence,
  };
}

/**
 * ------------------------------------------------------------
 * ADAPTATION
 * ------------------------------------------------------------
 *
 * Mesure l'adaptation du comportement au contexte.
 *
 * Maximum : 10
 */
export function deriveAdaptationSignal({
  cognition = null,
  cognitivePlan = null,
  behaviorPolicy = null,
  cognitiveState = null,
} = {}) {
  let score = 0;
  const evidence = [];

  if (behaviorPolicy) {
    score += 3;
    evidence.push(
      "politique comportementale disponible"
    );
  }

  if (
    behaviorPolicy?.responseStyle ===
    "adaptive"
  ) {
    score += 2;
    evidence.push(
      "registre de réponse adaptatif"
    );
  }

  if (
    cognition?.possibleRepetition
  ) {
    score += 2;
    evidence.push(
      "signal de répétition pris en compte"
    );
  }

  if (
    cognitiveState?.cognitiveLoad === "low" ||
    cognitiveState?.cognitiveLoad === "normal"
  ) {
    score += 3;
    evidence.push(
      "charge cognitive compatible avec le comportement"
    );
  }

  return {
    score: clamp(score, 0, 10),
    evidence,
  };
}

/**
 * ------------------------------------------------------------
 * FIABILITÉ
 * ------------------------------------------------------------
 *
 * Mesure la qualité observable de la réponse et la présence de
 * limitations critiques.
 *
 * Maximum : 10
 */
export function deriveReliabilitySignal({
  performanceResult = null,
} = {}) {
  let score = 0;
  const evidence = [];

  const demonstratedScore =
    Number(
      performanceResult?.demonstratedScore
    );

  if (
    Number.isFinite(demonstratedScore)
  ) {
    score += clamp(
      demonstratedScore * 0.06,
      0,
      6
    );

    evidence.push(
      `performance démontrée: ${Math.round(
        demonstratedScore
      )}`
    );
  }

  const limitations =
    Array.isArray(
      performanceResult?.limitations
    )
      ? performanceResult.limitations
      : [];

  const hasFactCheckLimitation =
    limitations.some(
      (item) =>
        String(item?.limitation || item)
          .toLowerCase()
          .includes("vérité factuelle")
    );

  if (!hasFactCheckLimitation) {
    score += 2;
    evidence.push(
      "aucune limitation factuelle explicite détectée"
    );
  }

  const hasResponse =
    Array.isArray(
      performanceResult?.evidence
    ) &&
    performanceResult.evidence.some(
      (item) =>
        String(item)
          .toLowerCase()
          .includes("réponse")
    );

  if (hasResponse) {
    score += 2;
    evidence.push(
      "réponse effectivement produite"
    );
  }

  return {
    score: clamp(score, 0, 10),
    evidence,
  };
}

/**
 * ------------------------------------------------------------
 * SIGNALS COMPLETS
 * ------------------------------------------------------------
 */
export function deriveOperationalSignals({
  cognitiveResult = null,
  performanceResult = null,
  cognitivePlan = null,
  cognition = null,
  workingMemory = null,
  memories = [],
  capabilities = {},
  behaviorPolicy = null,
  cognitiveState = null,
} = {}) {
  const integration =
    deriveIntegrationSignal({
      cognitivePlan,
      cognition,
      workingMemory,
      memories,
      capabilities,
    });

  const capability =
    deriveCapabilitySignal({
      cognition,
      cognitivePlan,
      capabilities,
    });

  const adaptation =
    deriveAdaptationSignal({
      cognition,
      cognitivePlan,
      behaviorPolicy,
      cognitiveState,
    });

  const reliability =
    deriveReliabilitySignal({
      performanceResult,
    });

  return {
    integration,
    capabilities: capability,
    adaptation,
    reliability,
    evidence: [
      ...integration.evidence,
      ...capability.evidence,
      ...adaptation.evidence,
      ...reliability.evidence,
    ],
  };
}

export default {
  deriveIntegrationSignal,
  deriveCapabilitySignal,
  deriveAdaptationSignal,
  deriveReliabilitySignal,
  deriveOperationalSignals,
};