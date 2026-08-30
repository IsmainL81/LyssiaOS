/**
 * ============================================================
 * LYSSIA OS
 * Cognitive State Engine V1
 * ============================================================
 *
 * Transforme les résultats cognitifs de Lyssia en un état
 * opérationnel lisible par le reste du système.
 *
 * Ce moteur n'exécute aucune action et ne modifie aucun état
 * externe. Il produit uniquement une représentation dérivée.
 * ============================================================
 */

function clamp(value, min = 0, max = 100) {
  return Math.min(
    max,
    Math.max(min, Number(value) || 0)
  );
}

function round(value) {
  return Math.round(clamp(value));
}

function getStatus(score) {
  if (score >= 90) {
    return "EXCEPTIONAL";
  }

  if (score >= 80) {
    return "ADVANCED";
  }

  if (score >= 70) {
    return "SOLID";
  }

  if (score >= 60) {
    return "INTERMEDIATE";
  }

  if (score >= 50) {
    return "FRAGILE";
  }

  return "LIMITED";
}

function getCognitiveLoad({
  cognitiveScore = 0,
  confidence = 0,
  performance = 0,
} = {}) {
  const average =
    (
      clamp(cognitiveScore) +
      clamp(confidence) +
      clamp(performance)
    ) / 3;

  if (average >= 80) {
    return "low";
  }

  if (average >= 60) {
    return "normal";
  }

  if (average >= 40) {
    return "elevated";
  }

  return "high";
}

function getTrendState(
  trend = {}
) {
  const direction =
    trend?.direction || "stable";

  if (direction === "up") {
    return {
      direction: "up",
      delta: round(trend?.delta),
      label: "en progression",
    };
  }

  if (direction === "down") {
    return {
      direction: "down",
      delta: round(trend?.delta),
      label: "en baisse",
    };
  }

  return {
    direction: "stable",
    delta: 0,
    label: "stable",
  };
}

function getReadiness({
  cognitiveResult = null,
  capabilities = {},
} = {}) {
  const dimensions =
    cognitiveResult?.dimensions || {};

  return {
    conversation:
      capabilities.chat !== false &&
      (dimensions.comprehension ?? 0) >= 50,

    memory:
      capabilities.memory !== false &&
      (dimensions.memory ?? 0) >= 40,

    vision:
      capabilities.vision === true &&
      (dimensions.perception ?? 0) >= 50,

    planning:
      (dimensions.planning ?? 0) >= 50,

    reasoning:
      (dimensions.reasoning ?? 0) >= 50,

    action:
      capabilities.actions === true &&
      (dimensions.autonomy ?? 0) >= 60,
  };
}

/**
 * Construit l'état cognitif actuel.
 */
export function createCognitiveState({
  cognitiveResult = null,
  performanceResult = null,
  compositeResult = null,
  historySummary = null,
  capabilities = {},
} = {}) {
  const cognitiveScore =
    clamp(
      compositeResult?.compositeScore ??
      cognitiveResult?.cognitiveScore ??
      0
    );

  const confidence =
    round(
      compositeResult?.components?.confidence ??
      cognitiveResult?.dimensions?.confidence ??
      performanceResult?.dimensions?.consistency ??
      0
    );

  const performance =
    round(
      compositeResult?.components?.performance ??
      performanceResult?.demonstratedScore ??
      0
    );

  const cognitiveDimensions =
    cognitiveResult?.dimensions || {};

  /*
   * ============================================================
   * ÉTAT DES CAPACITÉS
   * ============================================================
   *
   * demonstrated  : capacité sollicitée et suffisamment démontrée
   * available     : capacité disponible mais pas démontrée
   * limited       : capacité sollicitée mais actuellement limitée
   * not_required   : capacité non nécessaire pour cette interaction
   * unavailable    : capacité indisponible dans l'environnement
   * ============================================================
   */

  function classifyDimension({
    score = 0,
    required = true,
    available = true,
    demonstrated = false,
  } = {}) {
    if (!available) {
      return "unavailable";
    }

    if (!required) {
      return "not_required";
    }

    if (demonstrated) {
      return "demonstrated";
    }

    if (score < 60) {
      return "limited";
    }

    return "available";
  }

  const dimensionState = {
    comprehension:
      classifyDimension({
        score:
          cognitiveDimensions.comprehension,
        required: true,
        available: true,
        demonstrated:
          performanceResult?.demonstratedScore >= 70,
      }),

    context:
      classifyDimension({
        score:
          cognitiveDimensions.context,
        required:
          Boolean(
            historySummary?.recentEpisodic?.length ||
            historySummary?.relevantSemantic?.length
          ),
        available:
          capabilities.context !== false,
        demonstrated:
          Boolean(
            historySummary?.recentEpisodic?.length ||
            historySummary?.relevantSemantic?.length
          ),
      }),

    memory:
      classifyDimension({
        score:
          cognitiveDimensions.memory,
        required:
          cognitiveResult?.needsMemory === true,
        available:
          capabilities.memory !== false,
        demonstrated:
          cognitiveResult?.needsMemory === true &&
          Boolean(
            cognitiveResult?.relevantMemories?.length ||
            cognitiveResult?.memories?.length
          ),
      }),

    perception:
      classifyDimension({
        score:
          cognitiveDimensions.perception,
        required:
          cognitiveResult?.needsVision === true,
        available:
          capabilities.vision === true,
        demonstrated:
          cognitiveResult?.needsVision === true &&
          capabilities.vision === true,
      }),

    planning:
      classifyDimension({
        score:
          compositeResult?.components?.plan ??
          cognitiveDimensions.planning,
        required: true,
        available: true,
        demonstrated:
          Number(
            compositeResult?.components?.plan ??
            cognitiveDimensions.planning ??
            0
          ) >= 70,
      }),

    reasoning:
      classifyDimension({
        score:
          cognitiveDimensions.reasoning,
        required: true,
        available: true,
        demonstrated:
          Number(
            performanceResult?.demonstratedScore ??
            0
          ) >= 70,
      }),

    autonomy:
      classifyDimension({
        score:
          cognitiveDimensions.autonomy,
        required: true,
        available:
          capabilities.actions === true,
        demonstrated:
          capabilities.actions === true &&
          Number(
            cognitiveDimensions.autonomy ?? 0
          ) >= 60,
      }),

    confidence:
      classifyDimension({
        score: confidence,
        required: true,
        available: true,
        demonstrated: confidence >= 75,
      }),
  };

  const dimensionScores = {
    comprehension:
      round(
        cognitiveDimensions.comprehension
      ),

    context:
      round(
        cognitiveDimensions.context
      ),

    memory:
      round(
        cognitiveDimensions.memory
      ),

    perception:
      round(
        cognitiveDimensions.perception
      ),

    planning:
      round(
        compositeResult?.components?.plan ??
        cognitiveDimensions.planning
      ),

    reasoning:
      round(
        cognitiveDimensions.reasoning
      ),

    autonomy:
      round(
        cognitiveDimensions.autonomy
      ),

    confidence,

    performance,
  };

  /*
   * ============================================================
   * FORCES
   * ============================================================
   */

  const strengths =
    Object.entries(dimensionScores)
      .filter(
        ([name, score]) =>
          score >= 75 &&
          (
            dimensionState[name] === "demonstrated" ||
            dimensionState[name] === "available"
          )
      )
      .sort(
        (a, b) => b[1] - a[1]
      )
      .slice(0, 3)
      .map(
        ([name, score]) => ({
          name,
          score,
          state: dimensionState[name],
        })
      );

  /*
   * ============================================================
   * FAIBLESSES
   * ============================================================
   *
   * Une capacité "not_required" ou "unavailable" n'est jamais
   * considérée comme une faiblesse cognitive.
   */

  const weaknesses =
    Object.entries(dimensionScores)
      .filter(
        ([name, score]) =>
          score < 60 &&
          dimensionState[name] === "limited"
      )
      .sort(
        (a, b) => a[1] - b[1]
      )
      .slice(0, 3)
      .map(
        ([name, score]) => ({
          name,
          score,
          state: dimensionState[name],
        })
      );

  const notRequired =
    Object.entries(dimensionState)
      .filter(
        ([, state]) =>
          state === "not_required"
      )
      .map(
        ([name]) => ({
          name,
          score:
            dimensionScores[name] ?? 0,
          state: "not_required",
        })
      );

  const unavailable =
    Object.entries(dimensionState)
      .filter(
        ([, state]) =>
          state === "unavailable"
      )
      .map(
        ([name]) => ({
          name,
          score:
            dimensionScores[name] ?? 0,
          state: "unavailable",
        })
      );

  const limitations = [
    ...(cognitiveResult?.limitations || []),
    ...(performanceResult?.limitations || []),
  ];

  const trend =
    getTrendState(
      historySummary?.trend
    );

  const readiness =
    getReadiness({
      cognitiveResult,
      capabilities,
    });

  return {
    currentScore:
      cognitiveScore,

    status:
      getStatus(cognitiveScore),

    trend,

    confidence,

    performance,

    cognitiveLoad:
      getCognitiveLoad({
        cognitiveScore,
        confidence,
        performance,
      }),

    dimensions:
      dimensionScores,

    dimensionState,

    strengths,

    weaknesses,

    notRequired,

    unavailable,

    limitations,

    readiness,

    history: {
      averageScore:
        historySummary?.averageScore ?? null,

      bestScore:
        historySummary?.bestScore ?? null,

      lowestScore:
        historySummary?.lowestScore ?? null,

      interactionsEvaluated:
        historySummary?.interactionsEvaluated ?? 0,
    },

    timestamp:
      new Date().toISOString(),
  };
}

export {
  clamp,
  round,
  getStatus,
  getCognitiveLoad,
  getTrendState,
  getReadiness,
};

export default {
  createCognitiveState,
  getStatus,
  getCognitiveLoad,
  getTrendState,
  getReadiness,
};