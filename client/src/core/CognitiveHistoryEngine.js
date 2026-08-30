/**
 * ============================================================
 * LYSSIA OS
 * Cognitive History Engine V1
 * ============================================================
 *
 * Conserve l'historique des scores cognitifs composites
 * et calcule leur évolution.
 *
 * Ce module ne dépend ni de React ni du navigateur.
 * ============================================================
 */

const MAX_HISTORY_LENGTH = 500;

function clamp(value, min = 0, max = 100) {
  return Math.min(
    max,
    Math.max(min, Number(value) || 0)
  );
}

function round(value) {
  return Math.round(clamp(value));
}

function normalizeEntry(entry = {}) {
  return {
    score: round(entry.score),
    timestamp:
      entry.timestamp ||
      new Date().toISOString(),
    source:
      entry.source ||
      "interaction",
  };
}

/**
 * Ajoute un score à l'historique.
 */
export function addCognitiveScore(
  history = [],
  entry = {}
) {
  const safeHistory =
    Array.isArray(history)
      ? history
      : [];

  const normalized =
    normalizeEntry(entry);

  return [
    ...safeHistory,
    normalized,
  ].slice(-MAX_HISTORY_LENGTH);
}

/**
 * Retourne le score courant.
 */
export function getCurrentScore(
  history = []
) {
  if (!Array.isArray(history) || history.length === 0) {
    return null;
  }

  return round(
    history[history.length - 1].score
  );
}

/**
 * Calcule la moyenne.
 */
export function getAverageScore(
  history = []
) {
  if (!Array.isArray(history) || history.length === 0) {
    return null;
  }

  const total =
    history.reduce(
      (sum, entry) =>
        sum + clamp(entry?.score),
      0
    );

  return round(
    total / history.length
  );
}

/**
 * Meilleur score observé.
 */
export function getBestScore(
  history = []
) {
  if (!Array.isArray(history) || history.length === 0) {
    return null;
  }

  return round(
    Math.max(
      ...history.map(
        (entry) => clamp(entry?.score)
      )
    )
  );
}

/**
 * Score le plus faible observé.
 */
export function getLowestScore(
  history = []
) {
  if (!Array.isArray(history) || history.length === 0) {
    return null;
  }

  return round(
    Math.min(
      ...history.map(
        (entry) => clamp(entry?.score)
      )
    )
  );
}

/**
 * Calcule la tendance sur les dernières observations.
 *
 * Une fenêtre courte évite qu'un ancien historique
 * domine complètement l'état actuel.
 */
export function getTrend(
  history = [],
  windowSize = 5
) {
  if (
    !Array.isArray(history) ||
    history.length < 2
  ) {
    return {
      direction: "stable",
      delta: 0,
    };
  }

  const window =
    history.slice(
      -Math.max(2, windowSize)
    );

  const first =
    clamp(window[0]?.score);

  const last =
    clamp(
      window[window.length - 1]?.score
    );

  const delta =
    round(last - first);

  if (delta >= 3) {
    return {
      direction: "up",
      delta,
    };
  }

  if (delta <= -3) {
    return {
      direction: "down",
      delta,
    };
  }

  return {
    direction: "stable",
    delta,
  };
}

/**
 * Produit une synthèse complète de l'historique.
 */
export function summarizeCognitiveHistory(
  history = []
) {
  const safeHistory =
    Array.isArray(history)
      ? history
      : [];

  const trend =
    getTrend(
      safeHistory
    );

  return {
    currentScore:
      getCurrentScore(
        safeHistory
      ),

    averageScore:
      getAverageScore(
        safeHistory
      ),

    bestScore:
      getBestScore(
        safeHistory
      ),

    lowestScore:
      getLowestScore(
        safeHistory
      ),

    trend,

    interactionsEvaluated:
      safeHistory.length,

    firstTimestamp:
      safeHistory[0]?.timestamp ||
      null,

    lastTimestamp:
      safeHistory[
        safeHistory.length - 1
      ]?.timestamp ||
      null,
  };
}

/**
 * Crée un état historique complet.
 */
export function createCognitiveHistory(
  history = []
) {
  const safeHistory =
    Array.isArray(history)
      ? history
      : [];

  return {
    history:
      safeHistory.map(
        normalizeEntry
      ),

    summary:
      summarizeCognitiveHistory(
        safeHistory
      ),
  };
}

export {
  clamp,
  round,
  normalizeEntry,
};

export default {
  addCognitiveScore,
  getCurrentScore,
  getAverageScore,
  getBestScore,
  getLowestScore,
  getTrend,
  summarizeCognitiveHistory,
  createCognitiveHistory,
};