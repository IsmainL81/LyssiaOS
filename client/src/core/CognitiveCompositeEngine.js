/**
 * ============================================================
 * LYSSIA OS
 * Cognitive Composite Engine V1
 * ============================================================
 *
 * Fusionne :
 *
 * 1. le score cognitif structurel ;
 * 2. la performance cognitive démontrée ;
 * 3. la confiance associée.
 *
 * Ce score ne constitue pas une mesure scientifique
 * de l'intelligence générale.
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

/**
 * Calcule le score composite.
 *
 * Pondération V1 :
 * architecture    30 %
 * performance     40 %
 * plan            20 %
 * confiance       10 %
 */
export function calculateCognitiveComposite({
  cognitiveResult = null,
  performanceResult = null,
  cognitivePlan = null,
} = {}) {
  const architecture =
    clamp(
      cognitiveResult?.cognitiveScore,
      0,
      100
    );

  const performance =
    clamp(
      performanceResult?.demonstratedScore,
      0,
      100
    );

  let plan = 30;

  if (cognitivePlan?.route) {
    plan += 15;
  }

  if (cognitivePlan?.action) {
    plan += 15;
  }

  if (cognitivePlan?.priority) {
    plan += 10;
  }

  if (
    typeof cognitivePlan?.needsMemory ===
      "boolean" &&
    typeof cognitivePlan?.needsVision ===
      "boolean"
  ) {
    plan += 10;
  }

  plan = round(plan);

  const confidence =
    clamp(
      cognitiveResult?.dimensions
        ?.confidence ??
        performanceResult
          ?.dimensions
          ?.consistency ??
        50
    );

  const compositeScore =
    round(
      architecture * 0.30 +
      performance * 0.40 +
      plan * 0.20 +
      confidence * 0.10
    );

  const strengths = [];
  const weaknesses = [];

  if (
    architecture >= 75
  ) {
    strengths.push(
      "architecture cognitive"
    );
  }

  if (
    performance >= 75
  ) {
    strengths.push(
      "performance démontrée"
    );
  }

  if (
    plan >= 75
  ) {
    strengths.push(
      "planification"
    );
  }

  if (
    confidence >= 80
  ) {
    strengths.push(
      "confiance"
    );
  }

  if (
    architecture < 60
  ) {
    weaknesses.push(
      "architecture cognitive"
    );
  }

  if (
    performance < 60
  ) {
    weaknesses.push(
      "performance démontrée"
    );
  }

  if (
    plan < 60
  ) {
    weaknesses.push(
      "planification"
    );
  }

  if (
    confidence < 60
  ) {
    weaknesses.push(
      "confiance"
    );
  }

  return {
    compositeScore,

    components: {
      architecture,
      performance,
      plan,
      confidence,
    },

    strengths,
    weaknesses,

    interpretation:
      getCompositeInterpretation(
        compositeScore
      ),

    timestamp:
      new Date().toISOString(),
  };
}

function getCompositeInterpretation(
  score
) {
  if (score >= 90) {
    return "Très haute capacité cognitive fonctionnelle.";
  }

  if (score >= 80) {
    return "Capacité cognitive fonctionnelle avancée.";
  }

  if (score >= 70) {
    return "Capacité cognitive fonctionnelle solide.";
  }

  if (score >= 60) {
    return "Capacité cognitive fonctionnelle intermédiaire.";
  }

  if (score >= 50) {
    return "Capacité cognitive fonctionnelle limitée.";
  }

  return "Capacité cognitive fonctionnelle faible.";
}

export default {
  calculateCognitiveComposite,
};