/**
 * CognitiveExperimentRegistry
 * ------------------------------------------------------------
 * Registre persistant des expériences cognitives de Lyssia.
 *
 * Principes :
 * - conservation des expériences proposées / en cours / terminées
 * - observations expérimentales
 * - recherche et mise à jour
 * - prévention des doublons actifs similaires
 * - aucune modification autonome du comportement
 */

const MAX_EXPERIMENTS = 100;
const ACTIVE_STATUSES = ["proposed", "running"];
const COMPLETED_STATUSES = [
  "completed",
  "cancelled",
  "rejected",
];

/**
 * Crée un registre normalisé.
 */
export function createExperimentRegistry(
  registry = []
) {
  if (!Array.isArray(registry)) {
    return [];
  }

  return registry
    .filter(Boolean)
    .map((experiment) =>
      normalizeExperiment(experiment)
    )
    .filter(Boolean)
    .slice(-MAX_EXPERIMENTS);
}

/**
 * Normalisation d'une expérience.
 */
function normalizeExperiment(
  experiment
) {
  if (!experiment) {
    return null;
  }

  const now =
    new Date().toISOString();

  return {
    ...experiment,

    id:
      experiment.id ||
      `EXP-${Date.now()}`,

    status:
      experiment.status ||
      "proposed",

    target:
      experiment.target ||
      "cognitive",

    mode:
      experiment.mode ||
      null,

    hypothesis:
      experiment.hypothesis ||
      "",

    targetLabel:
      experiment.targetLabel ||
      null,

    proposalConfidence:
      Number.isFinite(
        experiment.proposalConfidence
      )
        ? experiment.proposalConfidence
        : null,

    proposalType:
      experiment.proposalType ||
      null,

    proposalSource:
      experiment.proposalSource ||
      null,

    canExperiment:
      experiment.canExperiment !== false,

    canAutoModify: false,

    observations:
      Array.isArray(
        experiment.observations
      )
        ? experiment.observations
        : [],

    createdAt:
      experiment.createdAt ||
      now,

    updatedAt:
      now,
  };
}

/**
 * Recherche par identifiant.
 */
export function findExperiment(
  registry = [],
  experimentId
) {
  const currentRegistry =
    createExperimentRegistry(
      registry
    );

  return (
    currentRegistry.find(
      (experiment) =>
        experiment?.id ===
        experimentId
    ) || null
  );
}

/**
 * Recherche d'une expérience active similaire.
 *
 * Une expérience est considérée comme similaire
 * lorsqu'elle possède le même target et le même mode
 * et qu'elle est encore proposed ou running.
 */
export function findActiveSimilarExperiment(
  registry = [],
  {
    target = null,
    mode = null,
  } = {}
) {
  const currentRegistry =
    createExperimentRegistry(
      registry
    );

  return (
    currentRegistry.find(
      (experiment) => {
        if (
          !ACTIVE_STATUSES.includes(
            experiment?.status
          )
        ) {
          return false;
        }

        if (
          target &&
          experiment?.target !==
            target
        ) {
          return false;
        }

        if (
          mode &&
          experiment?.mode !== mode
        ) {
          return false;
        }

        return true;
      }
    ) || null
  );
}

/**
 * Enregistrement d'une expérience.
 */
export function registerExperiment(
  registry = [],
  experiment
) {
  const currentRegistry =
    createExperimentRegistry(
      registry
    );

  const normalized =
    normalizeExperiment(
      experiment
    );

  if (!normalized) {
    return currentRegistry;
  }

  const withoutDuplicate =
    currentRegistry.filter(
      (item) =>
        item?.id !==
        normalized.id
    );

  return [
    ...withoutDuplicate,
    normalized,
  ].slice(-MAX_EXPERIMENTS);
}

/**
 * Mise à jour d'une expérience.
 */
export function updateExperiment(
  registry = [],
  experimentId,
  updates = {}
) {
  const currentRegistry =
    createExperimentRegistry(
      registry
    );

  return currentRegistry.map(
    (experiment) => {
      if (
        experiment?.id !==
        experimentId
      ) {
        return experiment;
      }

      return normalizeExperiment({
        ...experiment,
        ...updates,
        id: experiment.id,
        canAutoModify: false,
      });
    }
  );
}

/**
 * Ajout d'une observation expérimentale.
 */
export function registerExperimentObservation(
  registry = [],
  experimentId,
  observation = {}
) {
  const experiment =
    findExperiment(
      registry,
      experimentId
    );

  if (!experiment) {
    return createExperimentRegistry(
      registry
    );
  }

  const normalizedObservation =
    {
      ...observation,
      timestamp:
        observation.timestamp ||
        new Date().toISOString(),
    };

  const observations = [
    ...(experiment.observations ||
      []),
    normalizedObservation,
  ];

  return updateExperiment(
    registry,
    experimentId,
    {
      observations,
    }
  );
}

/**
 * Expériences actives.
 */
export function getActiveExperiments(
  registry = []
) {
  const currentRegistry =
    createExperimentRegistry(
      registry
    );

  return currentRegistry.filter(
    (experiment) =>
      ACTIVE_STATUSES.includes(
        experiment?.status
      )
  );
}

/**
 * Expériences terminées.
 */
export function getCompletedExperiments(
  registry = []
) {
  const currentRegistry =
    createExperimentRegistry(
      registry
    );

  return currentRegistry.filter(
    (experiment) =>
      COMPLETED_STATUSES.includes(
        experiment?.status
      )
  );
}

/**
 * Dernière expérience enregistrée.
 */
export function getLatestExperiment(
  registry = []
) {
  const currentRegistry =
    createExperimentRegistry(
      registry
    );

  return (
    currentRegistry[
      currentRegistry.length - 1
    ] || null
  );
}

/**
 * Résumé du registre.
 */
export function summarizeExperimentRegistry(
  registry = []
) {
  const currentRegistry =
    createExperimentRegistry(
      registry
    );

  const active =
    getActiveExperiments(
      currentRegistry
    );

  const completed =
    getCompletedExperiments(
      currentRegistry
    );

  return {
    total:
      currentRegistry.length,

    active:
      active.length,

    completed:
      completed.length,

    proposed:
      currentRegistry.filter(
        (experiment) =>
          experiment?.status ===
          "proposed"
      ).length,

    running:
      currentRegistry.filter(
        (experiment) =>
          experiment?.status ===
          "running"
      ).length,

    latest:
      getLatestExperiment(
        currentRegistry
      ),
  };
}

/**
 * Export par défaut.
 */
export default {
  createExperimentRegistry,
  registerExperiment,
  findExperiment,
  findActiveSimilarExperiment,
  updateExperiment,
  registerExperimentObservation,
  getActiveExperiments,
  getCompletedExperiments,
  getLatestExperiment,
  summarizeExperimentRegistry,
};
