import Card from "./Card";
import CameraView from "../components/CameraView";
import { useLyssia } from "../core/LyssiaCore";
import {
  getStatusMeta,
  MODULES,
} from "../core/StatusEngine";

export default function Dashboard() {
  const {
    systemState,
    memories,
  } = useLyssia();

  return (
    <div
      style={{
        height: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "28px",
        color: "#f5f5f5",
        background:
          "radial-gradient(circle at top right, #1b2335 0%, #111827 38%, #080c14 100%)",
        overflow: "auto",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "3px",
              color: "#7dd3fc",
              textTransform: "uppercase",
              marginBottom: "7px",
            }}
          >
            LYSSIA OS
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 600,
              letterSpacing: "-0.5px",
            }}
          >
            Bonjour, Ismain
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#8b95a7",
              fontSize: "14px",
            }}
          >
            Centre de contrôle de Lyssia
          </p>
        </div>

        {/* ÉTAT GLOBAL */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 15px",
            borderRadius: "999px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <span
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "#34d399",
              boxShadow: "0 0 12px rgba(52, 211, 153, 0.8)",
            }}
          />

          <span
            style={{
              fontSize: "13px",
              color: "#86efac",
            }}
          >
            Système en ligne
          </span>
        </div>
      </header>

      {/* =====================================================
          ZONE PRINCIPALE
      ===================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(280px, 0.8fr) minmax(400px, 1.8fr)",
          gap: "20px",
          marginBottom: "22px",
        }}
      >
        {/* ===================================================
            AVATAR LYSSIA
        =================================================== */}

        <div
          style={{
            minHeight: "360px",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(145deg, rgba(30,41,59,0.9), rgba(8,12,20,0.95))",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Halo derrière Lyssia */}

          <div
            style={{
              position: "absolute",
              width: "230px",
              height: "230px",
              borderRadius: "50%",
              background: "rgba(125, 211, 252, 0.08)",
              filter: "blur(35px)",
              zIndex: 1,
            }}
          />

          {/* Cadre avatar */}

          <div
            style={{
              position: "relative",
              width: "210px",
              height: "250px",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(125,211,252,0.28)",
              background: "#0f172a",
              boxShadow:
                "0 0 50px rgba(125,211,252,0.12)",
              zIndex: 2,
            }}
          >
            <img
              src="/lyssia-avatar.png"
              alt="Lyssia"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                visibility: "visible",
                opacity: 1,
                zIndex: 3,
              }}
            />

            {/* Indicateur d'état */}

            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "11px",
                height: "11px",
                borderRadius: "50%",
                background: "#34d399",
                boxShadow:
                  "0 0 14px rgba(52,211,153,0.9)",
                border:
                  "2px solid rgba(5,9,18,0.8)",
                zIndex: 4,
              }}
            />
          </div>

          {/* Nom */}

          <div
            style={{
              marginTop: "20px",
              fontSize: "20px",
              letterSpacing: "3px",
              fontWeight: 500,
            }}
          >
            LYSSIA
          </div>

          {/* État */}

          <div
            style={{
              marginTop: "7px",
              fontSize: "12px",
              color: "#7dd3fc",
              letterSpacing: "2px",
            }}
          >
            EN VEILLE
          </div>
        </div>

        {/* ===================================================
            CENTRE DE CONTRÔLE
        =================================================== */}

        <div
          style={{
            minHeight: "360px",
            padding: "28px",
            boxSizing: "border-box",
            borderRadius: "20px",
            border:
              "1px solid rgba(255,255,255,0.08)",
            background:
              "rgba(15, 23, 42, 0.72)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "15px",
            }}
          >
            Présence
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "25px",
              fontWeight: 500,
            }}
          >
            Lyssia est prête.
          </h2>

          <p
            style={{
              color: "#94a3b8",
              lineHeight: 1.7,
              maxWidth: "650px",
              marginBottom: "30px",
            }}
          >
            Le système central est opérationnel. Les modules
            de conversation, mémoire, vision et audio pourront
            être connectés progressivement à cette interface.
          </p>

          {/* ACTIONS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px",
            }}
          >
            <button style={actionButton}>
              <span style={actionIcon}>💬</span>
              Conversation
            </button>

            <button style={actionButton}>
              <span style={actionIcon}>📷</span>
              Vision
            </button>

            <button style={actionButton}>
              <span style={actionIcon}>🧠</span>
              Mémoire
            </button>

            <button style={actionButton}>
              <span style={actionIcon}>🎙</span>
              Audio
            </button>

            <button style={actionButton}>
              <span style={actionIcon}>⚙️</span>
              Système
            </button>

            <button style={actionButton}>
              <span style={actionIcon}>🤖</span>
              Robot
            </button>
          </div>

          {/* MESSAGE SYSTÈME */}

          <div
            style={{
              marginTop: "28px",
              padding: "15px",
              borderRadius: "12px",
              background:
                "rgba(125,211,252,0.04)",
              border:
                "1px solid rgba(125,211,252,0.08)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "7px",
              }}
            >
              État de Lyssia
            </div>

            <div
              style={{
                fontSize: "14px",
                color: "#cbd5e1",
              }}
            >
              Tous les systèmes principaux sont prêts.
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MODULES SYSTÈME
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <Card title="🤖 Robot">
          <Status
            label="État"
            value="Déconnecté"
            warning={true}
          />
        </Card>

        <Card title="🧠 Intelligence Artificielle">
          <Status
            label="GPT"
            value="Connecté"
          />
        </Card>

        <Card title="📷 Vision">
          <Status
            label="Caméra"
            value="En attente"
          />
        </Card>

        <Card title="🎙 Audio">
          <Status
            label="Micro"
            value="En attente"
          />
        </Card>

        <Card title="🔋 Batterie">
          <Status
            label="Charge"
            value="-- %"
          />
        </Card>

        <Card title="💾 Mémoire">
          <Status
            label="Mémoire contextuelle"
            value="Disponible"
          />
        </Card>
      </div>

      {/* =====================================================
          ACTIVITÉ SYSTÈME
      ===================================================== */}

      <section
        style={{
          marginTop: "22px",
          padding: "22px",
          borderRadius: "18px",
          border:
            "1px solid rgba(255,255,255,0.07)",
          background:
            "rgba(15,23,42,0.55)",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            letterSpacing: "2px",
            color: "#64748b",
            textTransform: "uppercase",
            marginBottom: "15px",
          }}
        >
          Activité système
        </div>

        {/* Événement 1 */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow:
                "0 0 8px rgba(56,189,248,0.7)",
            }}
          />

          <span>
            Interface Lyssia OS initialisée
          </span>

          <span
            style={{
              marginLeft: "auto",
              color: "#475569",
              fontSize: "12px",
            }}
          >
            maintenant
          </span>
        </div>

        {/* Événement 2 */}

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#34d399",
              boxShadow:
                "0 0 8px rgba(52,211,153,0.7)",
            }}
          />

          <span>
            Vision autonome disponible
          </span>

          <span
            style={{
              marginLeft: "auto",
              color: "#475569",
              fontSize: "12px",
            }}
          >
            système
          </span>
        </div>

        {/* Événement 3 */}

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#a78bfa",
              boxShadow:
                "0 0 8px rgba(167,139,250,0.7)",
            }}
          />

          <span>
            Avatar Lyssia chargé
          </span>

          <span
            style={{
              marginLeft: "auto",
              color: "#475569",
              fontSize: "12px",
            }}
          >
            système
          </span>
        </div>
      </section>
    </div>
  );
}


/* ============================================================
   COMPOSANT STATUT
============================================================ */

function Status({
  label,
  value,
  warning = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
      }}
    >
      <span
        style={{
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: warning
            ? "#fbbf24"
            : "#86efac",
          fontSize: "13px",
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}


/* ============================================================
   STYLE DES BOUTONS
============================================================ */

const actionButton = {
  border:
    "1px solid rgba(125,211,252,0.16)",
  background:
    "rgba(125,211,252,0.045)",
  color: "#dbeafe",
  padding: "14px 15px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "13px",
  textAlign: "left",
  transition:
    "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const actionIcon = {
  fontSize: "17px",
};