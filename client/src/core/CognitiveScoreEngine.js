/**
 * ============================================================
 * LYSSIA OS
 * Cognitive Score Engine V1.1
 * ============================================================
 *
 * Mesure l'état cognitif fonctionnel de Lyssia.
 *
 * IMPORTANT :
 * Ce score n'est ni un QI ni une mesure scientifique
 * de l'intelligence.
 *
 * Il évalue les capacités actuellement démontrées
 * par l'architecture cognitive de Lyssia OS.
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

function hasArrayValues(value) {
  return Array.isArray(value) && value.length > 0;
}

/**
 * ------------------------------------------------------------
 * COMPRÉHENSION
 * ------------------------------------------------------------
 */
function scoreComprehension({
  message = "",
  cognition = null,
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 25;

  if (String(message).trim()) {
    score += 25;
    evidence.push("message non vide");
  } else {
    limitations.push("aucun message exploitable");
  }

  if (cognition?.intent) {
    score += 25;
    evidence.push(`intention détectée: ${cognition.intent}`);
  } else {
    limitations.push("intention non détectée");
  }

  if (cognition?.normalizedText) {
    score += 10;
    evidence.push("normalisation du texte effectuée");
  }

  if (typeof cognition?.possibleRepetition === "boolean") {
    score += 5;
    evidence.push("détection de répétition disponible");
  }

  if (cognition?.context) {
    score += 10;
    evidence.push("contexte cognitif construit");
  }

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * CONTEXTE
 * ------------------------------------------------------------
 */
function scoreContext({
  cognitivePlan = null,
  workingMemory = null,
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 20;

  if (cognitivePlan) {
    score += 20;
    evidence.push("plan cognitif disponible");
  }

  if (
    hasArrayValues(
      workingMemory?.recentEpisodic
    )
  ) {
    score += 25;
    evidence.push(
      "mémoire épisodique récente disponible"
    );
  } else {
    limitations.push(
      "aucun épisode récent disponible"
    );
  }

  if (
    hasArrayValues(
      workingMemory?.relevantSemantic
    )
  ) {
    score += 25;
    evidence.push(
      "mémoire sémantique pertinente disponible"
    );
  } else {
    limitations.push(
      "aucune connaissance sémantique pertinente"
    );
  }

  if (cognitivePlan?.possibleRepetition === true) {
    score += 10;
    evidence.push(
      "répétition potentielle détectée"
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
 * MÉMOIRE
 * ------------------------------------------------------------
 */
function scoreMemory({
  cognitivePlan = null,
  cognition = null,
  memories = [],
  workingMemory = null,
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 20;

  if (cognition?.needsMemory === true) {
    score += 10;
    evidence.push(
      "besoin mémoire identifié"
    );
  }

  if (
    hasArrayValues(
      memories
    )
  ) {
    score += 20;
    evidence.push(
      `${memories.length} mémoire(s) disponible(s)`
    );
  } else {
    limitations.push(
      "aucune mémoire explicite fournie"
    );
  }

  if (
    hasArrayValues(
      cognitivePlan?.memories
    )
  ) {
    score += 20;
    evidence.push(
      "souvenirs pertinents sélectionnés"
    );
  }

  if (
    hasArrayValues(
      workingMemory?.relevantSemantic
    )
  ) {
    score += 20;
    evidence.push(
      "contexte sémantique exploitable"
    );
  }

  if (
    hasArrayValues(
      workingMemory?.recentEpisodic
    )
  ) {
    score += 10;
    evidence.push(
      "contexte épisodique exploitable"
    );
  }

  limitations.push(
    "mémoire longue durée encore dépendante des mécanismes externes"
  );

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * PERCEPTION
 * ------------------------------------------------------------
 */
function scorePerception({
  cognitivePlan = null,
  cognition = null,
  capabilities = {},
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 20;

  if (
    capabilities.audio === true
  ) {
    score += 20;
    evidence.push(
      "entrée audio disponible"
    );
  }

  if (
    capabilities.vision === true
  ) {
    score += 30;
    evidence.push(
      "vision disponible"
    );
  }

  if (
    cognitivePlan?.needsVision === true ||
    cognition?.needsVision === true
  ) {
    score += 20;
    evidence.push(
      "besoin de perception visuelle détecté"
    );
  }

  if (
    capabilities.camera === true
  ) {
    score += 10;
    evidence.push(
      "caméra disponible"
    );
  }

  if (evidence.length === 0) {
    limitations.push(
      "aucune capacité perceptive confirmée"
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
 * PLANIFICATION
 * ------------------------------------------------------------
 *
 * La présence d'un routeur et d'une action ne suffit
 * pas à considérer la planification comme excellente.
 * ------------------------------------------------------------
 */
function scorePlanning({
  cognitivePlan = null,
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 30;

  if (cognitivePlan?.route) {
    score += 15;
    evidence.push(
      `route déterminée: ${cognitivePlan.route}`
    );
  }

  if (cognitivePlan?.action) {
    score += 15;
    evidence.push(
      `action déterminée: ${cognitivePlan.action}`
    );
  }

  if (cognitivePlan?.priority) {
    score += 10;
    evidence.push(
      `priorité déterminée: ${cognitivePlan.priority}`
    );
  }

  if (
    typeof cognitivePlan?.needsMemory === "boolean" &&
    typeof cognitivePlan?.needsVision === "boolean"
  ) {
    score += 10;
    evidence.push(
      "pré-requis mémoire/vision évalués"
    );
  }

  limitations.push(
    "aucune preuve d'exécution multi-étapes"
  );

  limitations.push(
    "aucune vérification automatique du résultat"
  );

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * RAISONNEMENT
 * ------------------------------------------------------------
 *
 * Le moteur symbolique montre une capacité de structuration,
 * mais ne permet pas à lui seul de mesurer la qualité du
 * raisonnement produit par le LLM.
 * ------------------------------------------------------------
 */
function scoreReasoning({
  cognitivePlan = null,
  cognition = null,
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 30;

  if (cognition?.intent) {
    score += 15;
    evidence.push(
      "intention analysée"
    );
  }

  if (cognition?.priority) {
    score += 10;
    evidence.push(
      "priorité analysée"
    );
  }

  if (cognitivePlan?.route) {
    score += 10;
    evidence.push(
      "route cognitive déterminée"
    );
  }

  if (cognitivePlan?.action) {
    score += 10;
    evidence.push(
      "action cognitive déterminée"
    );
  }

  if (
    typeof cognition?.possibleRepetition === "boolean"
  ) {
    score += 5;
    evidence.push(
      "répétition évaluée"
    );
  }

  limitations.push(
    "qualité interne du raisonnement LLM non évaluée"
  );

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * AUTONOMIE
 * ------------------------------------------------------------
 */
function scoreAutonomy({
  capabilities = {},
  cognitivePlan = null,
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 15;

  if (capabilities.chat === true) {
    score += 15;
    evidence.push(
      "conversation disponible"
    );
  }

  if (capabilities.memory === true) {
    score += 15;
    evidence.push(
      "mémoire disponible"
    );
  }

  if (capabilities.vision === true) {
    score += 10;
    evidence.push(
      "vision disponible"
    );
  }

  if (capabilities.actions === true) {
    score += 25;
    evidence.push(
      "actions système disponibles"
    );
  } else {
    limitations.push(
      "exécution générale d'actions non disponible"
    );
  }

  if (cognitivePlan?.action === "execute") {
    score += 10;
    evidence.push(
      "action d'exécution demandée"
    );
  }

  limitations.push(
    "autonomie générale encore limitée"
  );

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * CONFIANCE
 * ------------------------------------------------------------
 */
function scoreConfidence({
  cognitivePlan = null,
  cognition = null,
} = {}) {
  const evidence = [];
  const limitations = [];

  let score = 35;

  if (cognition?.intent) {
    score += 15;
    evidence.push(
      "intention explicitement identifiée"
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

  if (
    typeof cognition?.possibleRepetition === "boolean"
  ) {
    score += 5;
    evidence.push(
      "signal de répétition évalué"
    );
  }

  limitations.push(
    "confiance sémantique fine encore non probabiliste"
  );

  return {
    score: round(score),
    evidence,
    limitations,
  };
}

/**
 * ------------------------------------------------------------
 * SCORE GLOBAL
 * ------------------------------------------------------------
 */
export function calculateCognitiveScore(
  input = {}
) {
  const comprehension =
    scoreComprehension(input);

  const context =
    scoreContext(input);

  const memory =
    scoreMemory(input);

  const perception =
    scorePerception(input);

  const planning =
    scorePlanning(input);

  const reasoning =
    scoreReasoning(input);

  const autonomy =
    scoreAutonomy(input);

  const confidence =
    scoreConfidence(input);

  const dimensions = {
    comprehension: comprehension.score,
    context: context.score,
    memory: memory.score,
    perception: perception.score,
    planning: planning.score,
    reasoning: reasoning.score,
    autonomy: autonomy.score,
    confidence: confidence.score,
  };

  const details = {
    comprehension,
    context,
    memory,
    perception,
    planning,
    reasoning,
    autonomy,
    confidence,
  };

  const cognitiveScore = round(
    comprehension.score * 0.15 +
    context.score * 0.15 +
    memory.score * 0.12 +
    perception.score * 0.10 +
    planning.score * 0.15 +
    reasoning.score * 0.15 +
    autonomy.score * 0.08 +
    confidence.score * 0.10
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

  const allLimitations =
    Object.entries(details)
      .flatMap(
        ([dimension, detail]) =>
          detail.limitations.map(
            (limitation) => ({
              dimension,
              limitation,
            })
          )
      );

  return {
    cognitiveScore,
    dimensions,
    details,
    strengths,
    weaknesses,
    limitations: allLimitations,
    timestamp:
      new Date().toISOString(),
  };
}

export {
  clamp,
  scoreComprehension,
  scoreContext,
  scoreMemory,
  scorePerception,
  scorePlanning,
  scoreReasoning,
  scoreAutonomy,
  scoreConfidence,
};

export default {
  calculateCognitiveScore,
  scoreComprehension,
  scoreContext,
  scoreMemory,
  scorePerception,
  scorePlanning,
  scoreReasoning,
  scoreAutonomy,
  scoreConfidence,
};