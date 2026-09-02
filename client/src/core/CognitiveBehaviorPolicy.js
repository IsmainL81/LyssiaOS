/**
 * ============================================================
 * LYSSIA OS
 * Cognitive Behavior Policy V1
 * ============================================================
 *
 * Traduit l'état cognitif courant en paramètres
 * comportementaux simples.
 *
 * Cette couche ne génère aucune réponse.
 * Elle décrit uniquement le mode de fonctionnement
 * recommandé pour l'interaction courante.
 *
 * ============================================================
 */

export function getCognitiveBehaviorPolicy(
  cognitiveState = null
) {
  if (!cognitiveState) {
    return {
      mode: "default",
      responseStyle: "normal",
      verbosity: "normal",
      clarification: "normal",
      autonomy: "restricted",
      confidenceLevel: "unknown",
      reason: "no_cognitive_state",
    };
  }

  const {
    status = "UNKNOWN",
    cognitiveLoad = "unknown",
    confidence = 0,
    readiness = {},
    dimensionState = {},
  } = cognitiveState;

  let mode = "default";
  let responseStyle = "normal";
  let verbosity = "normal";
  let clarification = "normal";

  if (
    cognitiveLoad === "high" ||
    cognitiveLoad === "very_high"
  ) {
    mode = "reduced_load";
    responseStyle = "concise";
    verbosity = "reduced";
    clarification = "explicit";
  } else if (
    status === "ADVANCED" &&
    cognitiveLoad === "low"
  ) {
    mode = "advanced";
    responseStyle = "adaptive";
    verbosity = "normal";
    clarification = "minimal";
  }

  if (
    confidence < 60 ||
    dimensionState.comprehension === "limited"
  ) {
    clarification = "explicit";
  }

  const autonomy =
    readiness.autonomy === true &&
    dimensionState.autonomy !== "unavailable"
      ? "available"
      : "restricted";

  let confidenceLevel = "low";

  if (confidence >= 80) {
    confidenceLevel = "high";
  } else if (confidence >= 60) {
    confidenceLevel = "moderate";
  }

  return {
    mode,
    responseStyle,
    verbosity,
    clarification,
    autonomy,
    confidenceLevel,
    reason: "cognitive_state",
  };
}

export default {
  getCognitiveBehaviorPolicy,
};