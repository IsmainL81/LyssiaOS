import {
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";

/**
 * ============================================================
 * LYSSIA OS
 * Cognitive State Panel V1
 * ============================================================
 *
 * Affiche l'état cognitif courant fourni par LyssiaCore.
 *
 * Aucun calcul cognitif n'est effectué ici.
 * ============================================================
 */

export default function CognitiveStatePanel({
  cognitiveState = null,
  cognitiveHistory = [],
  operationalIndex = null,
}) {
  if (!cognitiveState) {
    return (
      <Box>
        <Typography
          sx={{
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          État cognitif en attente d'une première interaction.
        </Typography>
      </Box>
    );
  }

  const {
    currentScore = 0,
    status = "UNKNOWN",
    trend = {},
    confidence = 0,
    performance = 0,
    cognitiveLoad = "unknown",
    strengths = [],
    weaknesses = [],
    history = {},
    dimensions = {},
    dimensionState = {},
  } = cognitiveState;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 36,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: -1,
              color: "#f8fafc",
            }}
          >
            {currentScore}
          </Typography>

          <Typography
            sx={{
              mt: 0.6,
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            SCORE COGNITIF
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: "right",
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: "#c4b5fd",
            }}
          >
            {status}
          </Typography>

          <Typography
            sx={{
              mt: 0.4,
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            {trend?.label || "stable"}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gap: 1.2,
        }}
      >
        <Metric
          label="Confiance"
          value={confidence}
        />

        <Metric
          label="Performance"
          value={performance}
        />
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Info
          label="Charge"
          value={formatCognitiveLoad(cognitiveLoad)}
        />

        <Info
          label="Interactions"
          value={history?.interactionsEvaluated ?? 0}
        />
      </Box>

      <Box
        sx={{
          mt: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "#cbd5e1",
            mb: 1,
          }}
        >
          DIMENSIONS COGNITIVES
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 0.9,
          }}
        >
          {Object.entries(dimensions)
            .filter(([name]) =>
              Object.prototype.hasOwnProperty.call(
                dimensionState,
                name
              )
            )
            .map(
              ([name, score]) => (
                <DimensionRow
                  key={name}
                  name={name}
                  score={score}
                  state={dimensionState[name]}
                />
              )
            )}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "#cbd5e1",
            mb: 0.8,
          }}
        >
          FORCES
        </Typography>

        {strengths.length > 0 ? (
          strengths.map((item) => (
            <Typography
              key={`${item.name}-${item.score}`}
              sx={{
                fontSize: 11,
                color: "#94a3b8",
                mb: 0.4,
              }}
            >
              {formatDimension(item.name)} · {item.score}
            </Typography>
          ))
        ) : (
          <Typography
            sx={{
              fontSize: 11,
              color: "#64748b",
            }}
          >
            Aucune force dominante identifiée.
          </Typography>
        )}
      </Box>

      {weaknesses.length > 0 && (
        <Box
          sx={{
            mt: 1.8,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#cbd5e1",
              mb: 0.8,
            }}
          >
            POINTS À SURVEILLER
          </Typography>

          {weaknesses.map((item) => (
            <Typography
              key={`${item.name}-${item.score}`}
              sx={{
                fontSize: 11,
                color: "#94a3b8",
                mb: 0.4,
              }}
            >
              {formatDimension(item.name)} · {item.score}
            </Typography>
          ))}
        </Box>
      )}

      {operationalIndex && (
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop:
              "1px solid rgba(148,163,184,0.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#cbd5e1",
                  mb: 0.4,
                }}
              >
                ⚙️ INDICE OPÉRATIONNEL
              </Typography>

              <Typography
                sx={{
                  fontSize: 28,
                  lineHeight: 1,
                  fontWeight: 700,
                  color: "#e9d5ff",
                }}
              >
                {operationalIndex.operationalIndex ?? "—"}

                <Typography
                  component="span"
                  sx={{
                    ml: 0.5,
                    fontSize: 11,
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  / 155
                </Typography>
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#c4b5fd",
              }}
            >
              {operationalIndex.level || "UNKNOWN"}
            </Typography>
          </Box>

          {operationalIndex.components && (
            <Box
              sx={{
                mt: 1.5,
                display: "grid",
                gap: 0.8,
              }}
            >
              <OperationalComponent
                label="Base cognitive"
                value={
                  operationalIndex.components.cognitive
                }
              />

              <OperationalComponent
                label="Intégration"
                value={
                  operationalIndex.components.integration
                }
                prefix="+"
              />

              <OperationalComponent
                label="Capacités"
                value={
                  operationalIndex.components.capabilities
                }
                prefix="+"
              />

              <OperationalComponent
                label="Adaptation"
                value={
                  operationalIndex.components.adaptation
                }
                prefix="+"
              />

              <OperationalComponent
                label="Fiabilité"
                value={
                  operationalIndex.components.reliability
                }
                prefix="+"
              />
            </Box>
          )}
        </Box>
      )}

      <HistoryChart
        history={cognitiveHistory}
      />

      <Box
        sx={{
          mt: 2,
          pt: 1.5,
          borderTop:
            "1px solid rgba(148,163,184,0.08)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
        }}
      >
        <Info
          label="Moyenne"
          value={history?.averageScore ?? "—"}
        />

        <Info
          label="Meilleur"
          value={history?.bestScore ?? "—"}
        />

        <Info
          label="Plus bas"
          value={history?.lowestScore ?? "—"}
        />
      </Box>
    </Box>
  );
}

function HistoryChart({
  history = [],
}) {
  const entries = Array.isArray(history)
    ? history.slice(-12)
    : [];

  if (entries.length < 2) {
    return (
      <Box
        sx={{
          mt: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "#cbd5e1",
            mb: 0.8,
          }}
        >
          ÉVOLUTION
        </Typography>

        <Typography
          sx={{
            fontSize: 10,
            color: "#64748b",
          }}
        >
          Au moins deux observations sont nécessaires.
        </Typography>
      </Box>
    );
  }

  const width = 320;
  const height = 90;
  const paddingX = 8;
  const paddingY = 10;

  const scores = entries.map(
    (entry) =>
      Math.max(
        0,
        Math.min(100, Number(entry?.score) || 0)
      )
  );

  const minScore = Math.max(
    0,
    Math.min(...scores) - 5
  );

  const maxScore = Math.min(
    100,
    Math.max(...scores) + 5
  );

  const range =
    Math.max(1, maxScore - minScore);

  const points = scores
    .map((score, index) => {
      const x =
        paddingX +
        (index / (scores.length - 1)) *
          (width - paddingX * 2);

      const y =
        height -
        paddingY -
        ((score - minScore) / range) *
          (height - paddingY * 2);

      return `${x},${y}`;
    })
    .join(" ");

  const latest =
    scores[scores.length - 1];

  return (
    <Box
      sx={{
        mt: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.8,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "#cbd5e1",
          }}
        >
          ÉVOLUTION
        </Typography>

        <Typography
          sx={{
            fontSize: 10,
            color: "#64748b",
          }}
        >
          {entries.length} observations
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
          background:
            "rgba(15,23,42,0.34)",
          border:
            "1px solid rgba(148,163,184,0.06)",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="90"
          preserveAspectRatio="none"
        >
          <polyline
            points={points}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {scores.map((score, index) => {
            const x =
              paddingX +
              (index / (scores.length - 1)) *
                (width - paddingX * 2);

            const y =
              height -
              paddingY -
              ((score - minScore) / range) *
                (height - paddingY * 2);

            return (
              <circle
                key={`${entries[index]?.timestamp}-${index}`}
                cx={x}
                cy={y}
                r="2.8"
                fill="#e9d5ff"
              />
            );
          })}
        </svg>
      </Box>

      <Box
        sx={{
          mt: 0.5,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: 9,
            color: "#64748b",
          }}
        >
          {scores[0]}
        </Typography>

        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            color: "#c4b5fd",
          }}
        >
          {latest}
        </Typography>
      </Box>
    </Box>
  );
}

function DimensionRow({
  name,
  score,
  state,
}) {
  const normalizedScore =
    Math.max(
      0,
      Math.min(
        100,
        Number(score) || 0
      )
    );

  const inactive =
    state === "not_required" ||
    state === "unavailable";

  return (
    <Box
      sx={{
        px: 1,
        py: 0.8,
        borderRadius: 1.5,
        background:
          inactive
            ? "rgba(15,23,42,0.18)"
            : "rgba(15,23,42,0.32)",
        opacity: inactive ? 0.62 : 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            minWidth: 0,
            fontSize: 10,
            color: "#cbd5e1",
          }}
        >
          {formatDimension(name)}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              color: "#f8fafc",
            }}
          >
            {score ?? "—"}
          </Typography>

          <Typography
            sx={{
              fontSize: 9,
              color: "#64748b",
              whiteSpace: "nowrap",
            }}
          >
            {formatDimensionState(state)}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 0.6,
          width: "100%",
          height: 3,
          borderRadius: 10,
          overflow: "hidden",
          background:
            "rgba(148,163,184,0.08)",
        }}
      >
        <Box
          sx={{
            width: `${normalizedScore}%`,
            height: "100%",
            borderRadius: 10,
            background:
              inactive
                ? "rgba(148,163,184,0.30)"
                : "linear-gradient(90deg, #7c3aed, #a78bfa)",
          }}
        />
      </Box>
    </Box>
  );
}

function formatDimensionState(state) {
  const labels = {
    demonstrated: "Démontrée",
    available: "Disponible",
    limited: "Limitée",
    not_required: "Non requise",
    unavailable: "Indisponible",
  };

  return labels[state] || "Non évaluée";
}

function formatCognitiveLoad(load) {
  const labels = {
    very_low: "Très faible",
    low: "Faible",
    normal: "Normale",
    high: "Élevée",
    very_high: "Très élevée",
  };

  return labels[load] || load || "Inconnue";
}

function OperationalComponent({
  label,
  value,
  prefix = "",
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          color: "#64748b",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 10,
          color: "#cbd5e1",
          fontWeight: 600,
        }}
      >
        {prefix}
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            color: "#94a3b8",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: 11,
            color: "#e2e8f0",
            fontWeight: 600,
          }}
        >
          {value}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={Math.max(
          0,
          Math.min(100, Number(value) || 0)
        )}
        sx={{
          height: 4,
          borderRadius: 10,
          background:
            "rgba(148,163,184,0.10)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 10,
            background:
              "linear-gradient(90deg, #7c3aed, #a78bfa)",
          },
        }}
      />
    </Box>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 9,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.3,
          fontSize: 12,
          color: "#e2e8f0",
          fontWeight: 600,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function formatDimension(name) {
  const labels = {
    comprehension: "Compréhension",
    context: "Contexte",
    memory: "Mémoire",
    perception: "Perception",
    planning: "Planification",
    reasoning: "Raisonnement",
    autonomy: "Autonomie",
    confidence: "Confiance",
    performance: "Performance",
  };

  return labels[name] || name;
}