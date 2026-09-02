/**
 * ============================================================
 * LYSSIA OS
 * Cognitive Operational Index Engine V1
 * ============================================================
 *
 * Indicateur interne de progression des capacités
 * opérationnelles de Lyssia OS.
 *
 * IMPORTANT :
 * - Ce score ne mesure pas l'intelligence humaine.
 * - Ce score ne constitue pas une mesure médicale.
 * - Ce score ne constitue pas une mesure psychologique.
 * - Ce score ne constitue pas un QI.
 *
 * Échelle V1 :
 *
 * Base cognitive        0–100
 * Intégration           +0–15
 * Capacités             +0–20
 * Adaptation            +0–10
 * Fiabilité             +0–10
 *
 * Maximum théorique : 155
 *
 * ============================================================
 */

const LIMITS = {
  cognitive: 100,
  integration: 15,
  capabilities: 20,
  adaptation: 10,
  reliability: 10,
};

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

function round(value) {
  return Math.round(value);
}

/**
 * Calcule l'indice opérationnel.
 */
export function calculateCognitiveOperationalIndex({
  cognitiveScore = 0,
  integration = 0,
  capabilities = 0,
  adaptation = 0,
  reliability = 0,
} = {}) {
  const baseCognitive =
    clamp(
      cognitiveScore,
      0,
      LIMITS.cognitive
    );

  const integrationScore =
    clamp(
      integration,
      0,
      LIMITS.integration
    );

  const capabilitiesScore =
    clamp(
      capabilities,
      0,
      LIMITS.capabilities
    );

  const adaptationScore =
    clamp(
      adaptation,
      0,
      LIMITS.adaptation
    );

  const reliabilityScore =
    clamp(
      reliability,
      0,
      LIMITS.reliability
    );

  const operationalIndex =
    round(
      baseCognitive +
      integrationScore +
      capabilitiesScore +
      adaptationScore +
      reliabilityScore
    );

  return {
    operationalIndex,

    components: {
      cognitive: round(
        baseCognitive
      ),

      integration: round(
        integrationScore
      ),

      capabilities: round(
        capabilitiesScore
      ),

      adaptation: round(
        adaptationScore
      ),

      reliability: round(
        reliabilityScore
      ),
    },

    limits: {
      ...LIMITS,
    },

    maximum: Object.values(
      LIMITS
    ).reduce(
      (sum, value) =>
        sum + value,
      0
    ),
  };
}

/**
 * Classe l'indice opérationnel.
 *
 * Ces niveaux sont internes au modèle V1.
 */
export function classifyCognitiveOperationalIndex(
  operationalIndex = 0
) {
  const score =
    Number(operationalIndex) || 0;

  if (score >= 150) {
    return "EXPERIMENTAL";
  }

  if (score >= 130) {
    return "EXPANSIVE";
  }

  if (score >= 115) {
    return "SUPERIOR";
  }

  if (score >= 100) {
    return "ADVANCED";
  }

  if (score >= 80) {
    return "SOLID";
  }

  if (score >= 60) {
    return "FUNCTIONAL";
  }

  return "EMERGING";
}

/**
 * Retourne le calcul complet avec son niveau.
 */
export function evaluateCognitiveOperationalIndex(
  input = {}
) {
  const result =
    calculateCognitiveOperationalIndex(
      input
    );

  return {
    ...result,

    level:
      classifyCognitiveOperationalIndex(
        result.operationalIndex
      ),
  };
}

export {
  LIMITS,
  clamp,
  round,
};

export default {
  calculateCognitiveOperationalIndex,
  classifyCognitiveOperationalIndex,
  evaluateCognitiveOperationalIndex,
};