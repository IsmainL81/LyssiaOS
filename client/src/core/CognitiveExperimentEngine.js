/**
 * ============================================================
 * LYSSIA OS
 * Cognitive Experiment Engine V1
 * ============================================================
 *
 * Prépare et évalue des expériences d'amélioration.
 *
 * V1 :
 * - crée une hypothèse ;
 * - établit une baseline ;
 * - observe une fenêtre expérimentale ;
 * - mesure le résultat ;
 * - produit un verdict.
 *
 * IMPORTANT :
 * - aucune modification automatique du système ;
 * - aucune modification du code ;
 * - aucune modification du noyau.
 *
 * ============================================================
 */

const DEFAULT_WINDOW_SIZE = 5;
const MIN_IMPROVEMENT = 2;

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

/**
 * ------------------------------------------------------------
 * BASELINE
 * ------------------------------------------------------------
 */
export function createExperimentBaseline({
  history = [],
  windowSize = DEFAULT_WINDOW_SIZE,
} = {}) {
  const entries =
    getValidEntries(history);

  const safeWindowSize =
    Math.max(
      1,
      Number(windowSize) ||
        DEFAULT_WINDOW_SIZE
    );

  const window =
    entries.slice(
      -safeWindowSize
    );

  const scores =
    window
      .map(
        (entry) =>
          numberOrNull(
            entry.operationalIndex
          )
      )
      .filter(
        (value) =>
          value !== null
      );

  if (scores.length === 0) {
    return {
      available: false,
      observations: 0,
      average: null,
      peak: null,
      current: null,
      components: {},
    };
  }

  const componentNames = [
    "cognitive",
    "integration",
    "capabilities",
    "adaptation",
    "reliability",
  ];

  const components = {};

  for (const name of componentNames) {
    const values =
      window
        .map(
          (entry) =>
            numberOrNull(
              entry
                ?.operationalComponents?.[name]
            )
        )
        .filter(
          (value) =>
            value !== null
        );

    components[name] =
      values.length > 0
        ? round(
            values.reduce(
              (sum, value) =>
                sum + value,
              0
            ) / values.length
          )
        : null;
  }

  return {
    available: true,

    observations:
      scores.length,

    average:
      round(
        scores.reduce(
          (sum, score) =>
            sum + score,
          0
        ) / scores.length
      ),

    peak:
      Math.max(...scores),

    current:
      scores[scores.length - 1],

    components,
  };
}

/**
 * ------------------------------------------------------------
 * CRÉATION
 * ------------------------------------------------------------
 */
export function createCognitiveExperiment({
  hypothesis = "",
  target = "",
  history = [],
  windowSize = DEFAULT_WINDOW_SIZE,
} = {}) {
  return {
    id:
      `EXP-${Date.now()}`,

    hypothesis:
      String(hypothesis).trim(),

    target:
      String(target).trim(),

    baseline:
      createExperimentBaseline({
        history,
        windowSize,
      }),

    windowSize:
      Math.max(
        1,
        Number(windowSize) ||
          DEFAULT_WINDOW_SIZE
      ),

    status:
      "proposed",

    canExperiment:
      true,

    canAutoModify:
      false,

    observations: [],

    createdAt:
      new Date().toISOString(),
  };
}

/**
 * ------------------------------------------------------------
 * OBSERVATION
 * ------------------------------------------------------------
 */
export function addExperimentObservation(
  experiment,
  observation = {}
) {
  if (!experiment) {
    return null;
  }

  const operationalIndex =
    numberOrNull(
      observation.operationalIndex
    );

  if (
    operationalIndex === null
  ) {
    return {
      ...experiment,

      observations: [
        ...(experiment.observations || []),
      ],

      error:
        "Operational Index invalide.",
    };
  }

  const operationalComponents =
    observation.operationalComponents &&
    typeof observation.operationalComponents ===
      "object"
      ? {
          cognitive:
            numberOrNull(
              observation
                .operationalComponents
                .cognitive
            ),

          integration:
            numberOrNull(
              observation
                .operationalComponents
                .integration
            ),

          capabilities:
            numberOrNull(
              observation
                .operationalComponents
                .capabilities
            ),

          adaptation:
            numberOrNull(
              observation
                .operationalComponents
                .adaptation
            ),

          reliability:
            numberOrNull(
              observation
                .operationalComponents
                .reliability
            ),
        }
      : null;

  const operationalEvidence =
    Array.isArray(
      observation.operationalEvidence
    )
      ? observation.operationalEvidence.slice(
          0,
          20
        )
      : [];

  return {
    ...experiment,

    observations: [
      ...(experiment.observations || []),

      {
        operationalIndex,

        cognitiveScore:
          numberOrNull(
            observation.cognitiveScore
          ),

        operationalComponents,

        operationalEvidence,

        timestamp:
          observation.timestamp ||
          new Date().toISOString(),
      },
    ],

    status:
      "running",
  };
}

/**
 * ------------------------------------------------------------
 * ÉVALUATION
 * ------------------------------------------------------------
 */
/**
 * ------------------------------------------------------------
 * COMPARAISON DES COMPOSANTES EXPÉRIMENTALES
 * ------------------------------------------------------------
 *
 * Compare la moyenne des composantes de la baseline avec
 * la moyenne des composantes observées pendant l'expérience.
 *
 * Cette fonction décrit une association observée.
 * Elle ne démontre pas une causalité.
 */
export function compareExperimentComponents(
  experiment
) {
  if (!experiment) {
    return {
      available: false,
      componentDifferences: {},
      improvedComponents: [],
      reducedComponents: [],
    };
  }

  const baselineComponents =
    experiment
      ?.baseline
      ?.components || {};

  const observations =
    Array.isArray(
      experiment?.observations
    )
      ? experiment.observations
      : [];

  if (
    observations.length === 0
  ) {
    return {
      available: false,
      componentDifferences: {},
      improvedComponents: [],
      reducedComponents: [],
    };
  }

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
    const baselineValue =
      numberOrNull(
        baselineComponents[name]
      );

    const experimentValues =
      observations
        .map(
          (entry) =>
            numberOrNull(
              entry
                ?.operationalComponents?.[name]
            )
        )
        .filter(
          (value) =>
            value !== null
        );

    if (
      baselineValue === null ||
      experimentValues.length === 0
    ) {
      componentDifferences[name] =
        null;

      continue;
    }

    const experimentAverage =
      round(
        experimentValues.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
          experimentValues.length
      );

    const delta =
      round(
        experimentAverage -
          baselineValue
      );

    componentDifferences[name] = {
      baseline:
        baselineValue,

      experiment:
        experimentAverage,

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

    componentDifferences,

    improvedComponents,

    reducedComponents,
  };
}

/**
 * ------------------------------------------------------------
 * ÉVALUATION
 * ------------------------------------------------------------
 */
export function evaluateExperiment(
  experiment
) {
  if (!experiment) {
    return {
      valid: false,
      verdict: "invalid",
    };
  }

  const baseline =
    numberOrNull(
      experiment?.baseline?.average
    );

  const observations =
    Array.isArray(
      experiment.observations
    )
      ? experiment.observations
      : [];

  const scores =
    observations
      .map(
        (observation) =>
          numberOrNull(
            observation.operationalIndex
          )
      )
      .filter(
        (value) =>
          value !== null
      );

  if (
    baseline === null ||
    scores.length === 0
  ) {
    return {
      valid: false,
      verdict: "insufficient_data",
      observations: scores.length,
      baseline,
      completed: false,
      canAutoModify: false,
    };
  }

  const resultAverage =
    round(
      scores.reduce(
        (sum, score) =>
          sum + score,
        0
      ) / scores.length
    );

  const resultPeak =
    Math.max(...scores);

  const delta =
    round(
      resultAverage -
        baseline
    );

  const completed =
    scores.length >=
    experiment.windowSize;

  let verdict =
    "not_confirmed";

  if (
    completed &&
    delta >= MIN_IMPROVEMENT
  ) {
    verdict =
      "promising";
  } else if (
    completed &&
    delta <= -MIN_IMPROVEMENT
  ) {
    verdict =
      "negative";
  } else if (completed) {
    verdict =
      "neutral";
  }

  return {
    valid: true,

    verdict,

    observations:
      scores.length,

    baseline,

    resultAverage,

    resultPeak,

    delta,

    completed,

    canAutoModify:
      false,
  };
}

/**
 * ------------------------------------------------------------
 * FINALISATION
 * ------------------------------------------------------------
 */
export function finalizeCognitiveExperiment(
  experiment
) {
  const evaluation =
    evaluateExperiment(
      experiment
    );

  return {
    ...experiment,

    status:
      evaluation.completed
        ? "completed"
        : experiment.status,

    evaluation,

    completedAt:
      evaluation.completed
        ? new Date().toISOString()
        : null,

    canAutoModify:
      false,
  };
}

/**
 * ------------------------------------------------------------
 * RÉSUMÉ
 * ------------------------------------------------------------
 */
export function summarizeExperiment(
  experiment
) {
  if (!experiment) {
    return "Expérience invalide.";
  }

  const evaluation =
    experiment.evaluation ||
    evaluateExperiment(
      experiment
    );

  const hypothesis =
    experiment.hypothesis ||
    "hypothèse non définie";

  if (!evaluation.valid) {
    return (
      `Hypothèse : ${hypothesis}. ` +
      "Données insuffisantes pour conclure."
    );
  }

  return (
    `Hypothèse : ${hypothesis}. ` +
    `Baseline : ${evaluation.baseline}. ` +
    `Résultat moyen : ${evaluation.resultAverage}. ` +
    `Écart : ${
      evaluation.delta >= 0
        ? "+"
        : ""
    }${evaluation.delta}. ` +
    `Verdict : ${evaluation.verdict}.`
  );
}

export default {
  createExperimentBaseline,
  createCognitiveExperiment,
  addExperimentObservation,
  evaluateExperiment,
  finalizeCognitiveExperiment,
  summarizeExperiment,
};