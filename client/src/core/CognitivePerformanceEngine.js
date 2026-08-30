/**
 * ============================================================
 * LYSSIA OS
 * Cognitive Performance Engine V1
 * ============================================================
 *
 * Évalue la qualité cognitive démontrée par une interaction.
 *
 * Ce moteur ne prétend pas mesurer l'intelligence générale.
 * Il mesure la qualité observable du traitement produit par
 * Lyssia à partir des signaux disponibles.
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

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(
      (token) => token.length >= 3
    );
}

/**
 * ------------------------------------------------------------
 * PERTINENCE
 * ------------------------------------------------------------
 *
 * Mesure grossièrement si la réponse reprend des éléments
 * lexicaux significatifs de la demande.
 */
function scoreRelevance({
  message = "",
  reply = "",
} = {}) {
  const messageTokens =
    new Set(tokenize(message));

  const replyTokens =
    new Set(tokenize(reply));

  const evidence = [];
  const limitations = [];

  if (replyTokens.size === 0) {
    return {
      score: 0,
      evidence: [],
      limitations: [
        "réponse vide ou inexploitable",
      ],
    };
  }

  if (messageTokens.size === 0) {
    return {
      score: 50,
      evidence: [
        "message sans contenu lexical exploitable",
      ],
      limitations: [
        "pertinence lexicale non calculable",
      ],
    };
  }

  const overlap =
    [...messageTokens].filter(
      (token) =>
        replyTokens.has(token)
    );

  const ratio =
    overlap.length /
    messageTokens.size;

  let score = 35;

  if (ratio >= 0.15) score += 15;
  if (ratio >= 0.30) score += 15;
  if (ratio >= 0.50) score += 15;
  if (ratio >= 0.70) score += 10;

  evidence.push(
    `${overlap.length} mot(s) partagé(s) avec la demande`
  );

  evidence.push(
    `couverture lexicale ${(ratio * 100).toFixed(0)} %`
  );

  if (reply.length >= 20) {
    score += 10;
    evidence.push(
      "réponse suffisamment développée"
    );
  }

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * ALIGNEMENT AVEC L'INTENTION
 * ------------------------------------------------------------
 */
function scoreIntentAlignment({
  cognition = null,
  reply = "",
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 45;

  if (cognition?.intent) {
    score += 25;

    evidence.push(
      `intention disponible: ${cognition.intent}`
    );
  } else {
    limitations.push(
      "intention indisponible"
    );
  }

  if (String(reply).trim()) {
    score += 20;

    evidence.push(
      "une réponse exploitable a été produite"
    );
  } else {
    score = 0;

    limitations.push(
      "aucune réponse produite"
    );
  }

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * COHÉRENCE ROUTE / RÉPONSE
 * ------------------------------------------------------------
 */
function scoreRouteConsistency({
  cognitivePlan = null,
  reply = "",
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 40;

  if (cognitivePlan?.route) {
    score += 20;

    evidence.push(
      `route utilisée: ${cognitivePlan.route}`
    );
  } else {
    limitations.push(
      "route cognitive absente"
    );
  }

  if (cognitivePlan?.action) {
    score += 20;

    evidence.push(
      `action prévue: ${cognitivePlan.action}`
    );
  }

  if (String(reply).trim()) {
    score += 10;

    evidence.push(
      "sortie produite après le plan"
    );
  }

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * CONTEXTUALITÉ
 * ------------------------------------------------------------
 */
function scoreContextuality({
  workingMemory = null,
  reply = "",
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 25;

  const hasRecent =
    Array.isArray(
      workingMemory?.recentEpisodic
    ) &&
    workingMemory.recentEpisodic.length > 0;

  const hasSemantic =
    Array.isArray(
      workingMemory?.relevantSemantic
    ) &&
    workingMemory.relevantSemantic.length > 0;

  if (hasRecent) {
    score += 25;
    evidence.push(
      "mémoire épisodique disponible"
    );
  } else {
    limitations.push(
      "aucun épisode récent disponible"
    );
  }

  if (hasSemantic) {
    score += 25;
    evidence.push(
      "contexte sémantique disponible"
    );
  } else {
    limitations.push(
      "aucun contexte sémantique disponible"
    );
  }

  if (String(reply).trim()) {
    score += 10;
  }

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * COMPLÉTUDE
 * ------------------------------------------------------------
 */
function scoreCompleteness({
  message = "",
  reply = "",
} = {}) {
  const evidence = [];
  const limitations = [];

  const replyLength =
    String(reply).trim().length;

  if (replyLength === 0) {
    return {
      score: 0,
      evidence: [],
      limitations: [
        "réponse vide",
      ],
    };
  }

  let score = 30;

  if (replyLength >= 20) {
    score += 20;
    evidence.push(
      "réponse substantielle"
    );
  }

  if (replyLength >= 80) {
    score += 15;
    evidence.push(
      "réponse développée"
    );
  }

  if (String(message).includes("?")) {
    if (replyLength >= 40) {
      score += 20;
      evidence.push(
        "réponse suffisamment développée pour une question"
      );
    } else {
      limitations.push(
        "réponse potentiellement trop courte pour une question"
      );
    }
  } else {
    score += 10;
  }

  if (
    /[.!?]$/.test(
      String(reply).trim()
    )
  ) {
    score += 5;
    evidence.push(
      "réponse correctement terminée"
    );
  }

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * COHÉRENCE STRUCTURELLE
 * ------------------------------------------------------------
 */
function scoreConsistency({
  cognition = null,
  cognitivePlan = null,
  reply = "",
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 35;

  if (cognition?.intent) {
    score += 15;
    evidence.push(
      "intention cohérente disponible"
    );
  }

  if (cognitivePlan?.route) {
    score += 15;
    evidence.push(
      "route cohérente disponible"
    );
  }

  if (cognitivePlan?.action) {
    score += 15;
    evidence.push(
      "action cohérente disponible"
    );
  }

  if (String(reply).trim()) {
    score += 10;
    evidence.push(
      "sortie finale disponible"
    );
  }

  limitations.push(
    "la vérité factuelle de la réponse n'est pas vérifiée"
  );

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * ÉVALUATION GLOBALE
 * ------------------------------------------------------------
 */
export function evaluateCognitivePerformance(
  input = {}
) {
  const relevance =
    scoreRelevance(input);

  const intentAlignment =
    scoreIntentAlignment(input);

  const routeConsistency =
    scoreRouteConsistency(input);

  const contextuality =
    scoreContextuality(input);

  const completeness =
    scoreCompleteness(input);

  const consistency =
    scoreConsistency(input);

  const dimensions = {
    relevance: relevance.score,
    intentAlignment:
      intentAlignment.score,
    routeConsistency:
      routeConsistency.score,
    contextuality:
      contextuality.score,
    completeness:
      completeness.score,
    consistency:
      consistency.score,
  };

  const details = {
    relevance,
    intentAlignment,
    routeConsistency,
    contextuality,
    completeness,
    consistency,
  };

  const demonstratedScore =
    round(
      relevance.score * 0.20 +
      intentAlignment.score * 0.20 +
      routeConsistency.score * 0.15 +
      contextuality.score * 0.15 +
      completeness.score * 0.15 +
      consistency.score * 0.15
    );

  const sorted =
    Object.entries(dimensions)
      .sort((a, b) => b[1] - a[1]);

  const strengths =
    sorted
      .slice(0, 3)
      .map(([name, score]) => ({
        name,
        score,
      }));

  const weaknesses =
    sorted
      .slice(-3)
      .reverse()
      .map(([name, score]) => ({
        name,
        score,
      }));

  const evidence =
    Object.entries(details)
      .flatMap(
        ([dimension, detail]) =>
          detail.evidence.map(
            (item) => ({
              dimension,
              evidence: item,
            })
          )
      );

  const limitations =
    Object.entries(details)
      .flatMap(
        ([dimension, detail]) =>
          detail.limitations.map(
            (item) => ({
              dimension,
              limitation: item,
            })
          )
      );

  return {
    demonstratedScore,
    dimensions,
    details,
    strengths,
    weaknesses,
    evidence,
    limitations,
    timestamp:
      new Date().toISOString(),
  };
}

export {
  clamp,
  tokenize,
  scoreRelevance,
  scoreIntentAlignment,
  scoreRouteConsistency,
  scoreContextuality,
  scoreCompleteness,
  scoreConsistency,
};

export default {
  evaluateCognitivePerformance,
  scoreRelevance,
  scoreIntentAlignment,
  scoreRouteConsistency,
  scoreContextuality,
  scoreCompleteness,
  scoreConsistency,
};