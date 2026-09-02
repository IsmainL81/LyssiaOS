/**
 * ============================================================
 * LYSSIA OS
 * Cognitive Adaptation Engine V1
 * ============================================================
 *
 * Moteur d'auto-observation de Lyssia.
 *
 * V1 :
 * - observe l'historique ;
 * - identifie les tendances ;
 * - compare les meilleures observations ;
 * - détecte les opportunités ;
 * - formule des recommandations.
 *
 * V1 NE MODIFIE AUCUNE CONFIGURATION.
 *
 * Cet indicateur n'est :
 * - ni un QI ;
 * - ni une mesure de l'intelligence humaine ;
 * - ni une mesure médicale ;
 * - ni une mesure psychologique.
 *
 * ============================================================
 */

import {
  createCognitiveExperiment,
} from "./CognitiveExperimentEngine.js";
function numberOrNull(value) {
  const numeric = Number(value);

  return Number.isFinite(numeric)
    ? numeric
    : null;
}

function round(value) {
  return Math.round(
    Number(value) || 0
  );
}

function getValidEntries(history = []) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.filter(
    (entry) =>
      numberOrNull(
        entry?.operationalIndex
      ) !== null
  );
}

function getScores(entries) {
  return entries
    .map((entry) =>
      numberOrNull(
        entry?.operationalIndex
      )
    )
    .filter(
      (value) => value !== null
    );
}

/**
 * ------------------------------------------------------------
 * STATISTIQUES
 * ------------------------------------------------------------
 */
export function summarizeOperationalHistory(
  history = []
) {
  const entries =
    getValidEntries(history);

  const scores =
    getScores(entries);

  if (scores.length === 0) {
    return {
      observations: 0,
      current: null,
      average: null,
      peak: null,
      lowest: null,
      delta: 0,
      peakGap: null,
      trend: "insufficient_data",
      trendConfidence: "none",
    };
  }

  const current =
    scores[scores.length - 1];

  const peak =
    Math.max(...scores);

  const lowest =
    Math.min(...scores);

  const average =
    round(
      scores.reduce(
        (sum, score) =>
          sum + score,
        0
      ) / scores.length
    );

  const delta =
    scores.length >= 2
      ? round(
          current -
            scores[scores.length - 2]
        )
      : 0;

  const peakGap =
    round(current - peak);

  let trend =
    "insufficient_data";

  let trendConfidence =
    "none";

  if (scores.length === 1) {
    trend = "insufficient_data";
    trendConfidence = "none";
  } else if (scores.length <= 4) {
    trend =
      Math.abs(delta) >= 3
        ? "recent_variation"
        : "stable";

    trendConfidence = "low";
  } else if (scores.length <= 6) {
    if (delta >= 3) {
      trend = "improving";
    } else if (delta <= -3) {
      trend = "declining";
    } else {
      trend = "stable";
    }

    trendConfidence = "medium";
  } else {
    if (delta >= 3) {
      trend = "improving";
    } else if (delta <= -3) {
      trend = "declining";
    } else {
      trend = "stable";
    }

    trendConfidence = "high";

  }

  return {
    observations:
      scores.length,

    current,

    average,

    peak,

    lowest,

    delta,

    peakGap,

    trend,

    trendConfidence,
  };
}

/**
 * ------------------------------------------------------------
 * ANALYSE DES COMPOSANTES
 * ------------------------------------------------------------
 */export function analyzeOperationalComponents(
  history = []
) {
  const entries =
    getValidEntries(history);

  const names = [
    "cognitive",
    "integration",
    "capabilities",
    "adaptation",
    "reliability",
  ];

  const result = {};

  for (const name of names) {
    const values = entries
      .map(
        (entry) =>
          numberOrNull(
            entry
              ?.operationalComponents?.[name]
          )
      )
      .filter(
        (value) => value !== null
      );

    result[name] = {
      average:
        values.length > 0
          ? round(
              values.reduce(
                (sum, value) =>
                  sum + value,
                0
              ) / values.length
            )
          : null,

      maximum:
        values.length > 0
          ? Math.max(...values)
          : null,

      observations:
        values.length,
    };
  }

  return result;
}

/**
 * ------------------------------------------------------------
 * MEILLEURES OBSERVATIONS
 * ------------------------------------------------------------
 */
export function findPeakObservations(
  history = [],
  limit = 3
) {
  const entries =
    getValidEntries(history);

  return [...entries]
    .sort(
      (a, b) =>
        Number(
          b?.operationalIndex
        ) -
        Number(
          a?.operationalIndex
        )
    )
    .slice(0, Math.max(1, limit))
    .map(
      (entry) => ({
        operationalIndex:
          numberOrNull(
            entry.operationalIndex
          ),

        cognitiveScore:
          numberOrNull(
            entry.score
          ),

        components:
          entry.operationalComponents ||
          null,

        evidence:
          Array.isArray(
            entry.operationalEvidence
          )
            ? entry.operationalEvidence
            : [],
      })
    );
}

/**
 * ------------------------------------------------------------
 * OPPORTUNITÉS
 * ------------------------------------------------------------
 */
/**
 * ------------------------------------------------------------
 * COMPARAISON AVEC LE PIC HISTORIQUE
 * ------------------------------------------------------------
 */
export function compareWithPeak(
  history = []
) {
  const entries =
    getValidEntries(history);

  if (entries.length < 2) {
    return {
      available: false,
      current: null,
      peak: null,
      componentDifferences: {},
      improvedComponents: [],
      reducedComponents: [],
      peakEvidence: [],
    };
  }

  const current =
    entries[entries.length - 1];

  const peak =
    [...entries].sort(
      (a, b) =>
        Number(b?.operationalIndex || 0) -
        Number(a?.operationalIndex || 0)
    )[0];

  const currentComponents =
    current?.operationalComponents || {};

  const peakComponents =
    peak?.operationalComponents || {};

  const names = [
    "cognitive",
    "integration",
    "capabilities",
    "adaptation",
    "reliability",
  ];

  const componentDifferences = {};
  const improvedComponents = [];
  const reducedComponents = [];

  for (const name of names) {
    const currentValue =
      numberOrNull(
        currentComponents[name]
      );

    const peakValue =
      numberOrNull(
        peakComponents[name]
      );

    if (
      currentValue === null ||
      peakValue === null
    ) {
      componentDifferences[name] = null;
      continue;
    }

    const delta =
      round(
        currentValue - peakValue
      );

    componentDifferences[name] = {
      current: currentValue,
      peak: peakValue,
      delta,
    };

    if (delta > 0) {
      improvedComponents.push({
        name,
        delta,
      });
    }

    if (delta < 0) {
      reducedComponents.push({
        name,
        delta,
      });
    }
  }

  return {
    available: true,

    current: {
      operationalIndex:
        numberOrNull(
          current.operationalIndex
        ),

      cognitiveScore:
        numberOrNull(
          current.score
        ),
    },

    peak: {
      operationalIndex:
        numberOrNull(
          peak.operationalIndex
        ),

      cognitiveScore:
        numberOrNull(
          peak.score
        ),
    },

    componentDifferences,

    improvedComponents,

    reducedComponents,

    peakEvidence:
      Array.isArray(
        peak.operationalEvidence
      )
        ? peak.operationalEvidence
        : [],
  };
}
export function detectAdaptationOpportunities({
  history = [],
  cognitiveState = null,
} = {}) {
  const summary =
    summarizeOperationalHistory(
      history
    );

  const peakComparison =
    compareWithPeak(
      history
    );

  const components =
    analyzeOperationalComponents(
      history
    );

  const opportunities = [];

  if (
    summary.observations >= 2 &&
    summary.peak !== null &&
    summary.current !== null &&
    summary.current < summary.peak
  ) {
    opportunities.push({
      type: "peak_recovery",
      priority: "normal",
      description:
        `Le niveau actuel (${summary.current}) ` +
        `est inférieur au meilleur niveau observé (${summary.peak}).`,
    });
  }

  if (
    components.reliability.average !== null &&
    components.reliability.average < 6
  ) {
    opportunities.push({
      type: "reliability",
      priority: "high",
      description:
        "La fiabilité constitue une zone prioritaire d'amélioration.",
    });
  }

  if (
    components.integration.average !== null &&
    components.integration.average < 8
  ) {
    opportunities.push({
      type: "integration",
      priority: "normal",
      description:
        "L'intégration des capacités pourrait être renforcée.",
    });
  }

  if (
    cognitiveState?.limitations?.length > 0
  ) {
    opportunities.push({
      type: "limitations",
      priority: "normal",
      description:
        `${cognitiveState.limitations.length} limitation(s) ` +
        "cognitive(s) restent identifiées.",
    });
  }

  if (
    summary.trend === "declining"
  ) {
    opportunities.push({
      type: "trend",
      priority: "high",
      description:
        "La tendance récente est orientée à la baisse.",
    });
  }

  return opportunities;
}

/**
 * ------------------------------------------------------------
 * RECOMMANDATIONS
 * ------------------------------------------------------------
 */
/**
 * ------------------------------------------------------------
 * PROPOSITION D'EXPÉRIENCE COGNITIVE
 * ------------------------------------------------------------
 *
 * Transforme une opportunité d'amélioration observée
 * en proposition expérimentale.
 *
 * Cette fonction ne lance aucune expérience.
 * Elle ne modifie aucune configuration.
 */
/**
 * ------------------------------------------------------------
 * PROPOSITION D'EXPÉRIENCE COGNITIVE
 * ------------------------------------------------------------
 *
 * Deux modes :
 *
 * recovery
 *   Le niveau courant est inférieur au meilleur niveau connu.
 *   L'objectif est d'identifier les conditions associées
 *   aux meilleures performances.
 *
 * exploration
 *   Le niveau courant égale le meilleur niveau connu.
 *   L'objectif devient alors de rechercher expérimentalement
 *   une amélioration au-delà du pic actuel.
 *
 * Aucun lancement automatique.
 * Aucune modification automatique.
 */
/**
 * ------------------------------------------------------------
 * RECOMMANDATIONS D'ADAPTATION
 * ------------------------------------------------------------
 */
export function generateAdaptationRecommendations({
  history = [],
  cognitiveState = null,
} = {}) {
  const opportunities =
    detectAdaptationOpportunities({
      history,
      cognitiveState,
    });

  return opportunities.map(
    (opportunity) => {
      switch (
        opportunity.type
      ) {
        case "peak_recovery":
          return {
            ...opportunity,

            recommendation:
              "Comparer les conditions associées aux meilleures observations avant toute modification du système.",
          };

        case "reliability":
          return {
            ...opportunity,

            recommendation:
              "Prioriser la vérification et la cohérence des sorties avant d'augmenter l'autonomie.",
          };

        case "integration":
          return {
            ...opportunity,

            recommendation:
              "Tester des interactions mobilisant plusieurs capacités simultanément.",
          };

        case "limitations":
          return {
            ...opportunity,

            recommendation:
              "Traiter les limitations récurrentes comme pistes de développement architectural.",
          };

        case "trend":
          return {
            ...opportunity,

            recommendation:
              "Analyser les dernières observations afin d'identifier la cause de la baisse.",
          };

        default:
          return {
            ...opportunity,

            recommendation:
              "Observer davantage d'interactions avant toute adaptation.",
          };
      }
    }
  );
}

/**
 * ------------------------------------------------------------
 * CONFIANCE D'OBSERVATION
 * ------------------------------------------------------------
 */
export function calculateAdaptationConfidence(
  history = []
) {
  const entries =
    getValidEntries(history);

  const count =
    entries.length;

  if (count === 0) {
    return 0;
  }

  if (count === 1) {
    return 35;
  }

  if (count === 2) {
    return 50;
  }

  if (count === 3) {
    return 65;
  }

  if (count >= 7) {
    return 85;
  }

  return 70;
}

/**
 * ------------------------------------------------------------
 * PROPOSITION D'EXPÉRIENCE
 * ------------------------------------------------------------
 */
/**
 * ------------------------------------------------------------
 * ÉVALUATION COGNITIVE ADAPTATIVE
 * ------------------------------------------------------------
 */
export function evaluateCognitiveAdaptation({
  history = [],
  cognitiveState = null,
} = {}) {
  const summary =
    summarizeOperationalHistory(
      history
    );

  const peakComparison =
    compareWithPeak(
      history
    );

  const components =
    analyzeOperationalComponents(
      history
    );

  const peaks =
    findPeakObservations(
      history
    );

  const opportunities =
    detectAdaptationOpportunities({
      history,
      cognitiveState,
    });

  const recommendations =
    generateAdaptationRecommendations({
      history,
      cognitiveState,
    });

  return {
    summary,

    peakComparison,

    components,

    peaks,

    opportunities,

    recommendations,

    confidence:
      calculateAdaptationConfidence(
        history
      ),

    mode:
      "observation_only",

    canAutoModify:
      false,

    timestamp:
      new Date().toISOString(),
  };
}

/**
 * ------------------------------------------------------------
 * PROPOSITION D'EXPÉRIENCE
 * ------------------------------------------------------------
 */
export function suggestCognitiveExperiment({
  history = [],
  cognitiveState = null,
} = {}) {
  const adaptation =
    evaluateCognitiveAdaptation({
      history,
      cognitiveState,
    });

  const comparison =
    adaptation.peakComparison;

  const observationCount =
    adaptation?.summary?.observations || 0;

  /*
   * Pas assez d'observations pour proposer
   * une expérimentation sérieuse.
   */
  if (observationCount < 3) {
    return {
      available: false,

      reason:
        "Nombre d'observations insuffisant.",

      mode:
        "observation_only",

      canExperiment:
        false,

      canAutoModify:
        false,

      confidence:
        adaptation.confidence,
    };
  }

  if (!comparison?.available) {
    return {
      available: false,

      reason:
        "Comparaison avec le pic insuffisante.",

      mode:
        "observation_only",

      canExperiment:
        false,

      canAutoModify:
        false,

      confidence:
        adaptation.confidence,
    };
  }

  const current =
    comparison.current
      ?.operationalIndex;

  const peak =
    comparison.peak
      ?.operationalIndex;

  if (
    current === null ||
    peak === null
  ) {
    return {
      available: false,

      reason:
        "Indice opérationnel indisponible.",

      mode:
        "observation_only",

      canExperiment:
        false,

      canAutoModify:
        false,

      confidence:
        adaptation.confidence,
    };
  }

  /*
   * ----------------------------------------------------------
   * MODE RECOVERY
   * ----------------------------------------------------------
   */
  if (current < peak) {
    const reduced =
      Array.isArray(
        comparison.reducedComponents
      )
        ? comparison.reducedComponents
        : [];

    if (reduced.length === 0) {
      return {
        available: false,

        reason:
          "Aucune différence exploitable avec le pic.",

        mode:
          "observation_only",

        canExperiment:
          false,

        canAutoModify:
          false,

        confidence:
          adaptation.confidence,
      };
    }

    const target =
      [...reduced].sort(
        (a, b) =>
          Math.abs(b.delta) -
          Math.abs(a.delta)
      )[0];

    if (!target?.name) {
      return {
        available: false,

        reason:
          "Aucune composante cible identifiable.",

        mode:
          "observation_only",

        canExperiment:
          false,

        canAutoModify:
          false,

        confidence:
          adaptation.confidence,
      };
    }

    const labels = {
      cognitive:
        "performance cognitive",

      integration:
        "intégration des capacités",

      capabilities:
        "mobilisation des capacités",

      adaptation:
        "adaptation comportementale",

      reliability:
        "fiabilité",
    };

    const targetLabel =
      labels[target.name] ||
      target.name;

    const hypothesis =
      `Une amélioration de ${targetLabel} ` +
      `pourrait être associée à une amélioration ` +
      `de l'Operational Index.`;

    const experiment =
      createCognitiveExperiment({
        hypothesis,

        target:
          target.name,

        history,

        windowSize:
          5,
      });

    return {
      available: true,

      type:
        "cognitive_experiment_proposal",

      mode:
        "recovery",

      target:
        target.name,

      targetLabel,

      current,

      peak,

      gap:
        current - peak,

      hypothesis,

      experiment,

      source:
        "cognitive_adaptation",

      canExperiment:
        true,

      canAutoModify:
        false,

      confidence:
        adaptation.confidence,
    };
  }

  /*
   * ----------------------------------------------------------
   * MODE EXPLORATION
   * ----------------------------------------------------------
   *
   * Le système est déjà sur son meilleur niveau connu.
   * Nous cherchons donc à dépasser le pic sans inventer
   * une faiblesse inexistante.
   */
  if (
    current === peak &&
    observationCount >= 5
  ) {
    const componentAnalysis =
      adaptation.components || {};

    const candidates = [
      "integration",
      "capabilities",
      "adaptation",
      "reliability",
    ]
      .map(
        (name) => ({
          name,

          average:
            componentAnalysis?.[name]
              ?.average ?? null,

          maximum:
            componentAnalysis?.[name]
              ?.maximum ?? null,
        })
      )
      .filter(
        (item) =>
          item.average !== null
      )
      .sort(
        (a, b) => {
          const aGap =
            (a.maximum ?? a.average) -
            a.average;

          const bGap =
            (b.maximum ?? b.average) -
            b.average;

          return bGap - aGap;
        }
      );

    const target =
      candidates[0] || {
        name:
          "capabilities",
      };

    const labels = {
      integration:
        "intégration des capacités",

      capabilities:
        "mobilisation des capacités",

      adaptation:
        "adaptation comportementale",

      reliability:
        "fiabilité",
    };

    const targetLabel =
      labels[target.name] ||
      target.name;

    const hypothesis =
      `Une optimisation de ${targetLabel} ` +
      `pourrait permettre de dépasser le ` +
      `meilleur Operational Index actuellement observé ` +
      `(${peak}).`;

    const experiment =
      createCognitiveExperiment({
        hypothesis,

        target:
          target.name,

        history,

        windowSize:
          5,
      });

    return {
      available: true,

      type:
        "cognitive_experiment_proposal",

      mode:
        "exploration",

      target:
        target.name,

      targetLabel,

      current,

      peak,

      gap:
        0,

      hypothesis,

      experiment,

      source:
        "cognitive_adaptation",

      canExperiment:
        true,

      canAutoModify:
        false,

      confidence:
        adaptation.confidence,
    };
  }

  return {
    available: false,

    reason:
      "Observation supplémentaire nécessaire avant exploration.",

    mode:
      "observation_only",

    canExperiment:
      false,

    canAutoModify:
      false,

    confidence:
      adaptation.confidence,
  };
}

/**
 * ------------------------------------------------------------
 * EXPORT
 * ------------------------------------------------------------
 */
export default {
  summarizeOperationalHistory,
  compareWithPeak,
  analyzeOperationalComponents,
  findPeakObservations,
  detectAdaptationOpportunities,
  generateAdaptationRecommendations,
  calculateAdaptationConfidence,
  evaluateCognitiveAdaptation,
  suggestCognitiveExperiment,
};