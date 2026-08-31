import { useState, useRef } from "react";

import { VoiceInputController } from "../features/voice/VoiceInputController";

/**
 * =====================================================
 * PAGE DE TEST — NOUVEAU SYSTÈME VOCAL (STT)
 * =====================================================
 * Page isolée, temporaire, dédiée uniquement à tester
 * VoiceInputController -> STTProvider -> /api/voice/transcribe.
 * N'utilise à aucun moment le système SpeechRecognition
 * existant (Conversation.jsx / VoiceEngine.js) -- aucun
 * risque de conflit de microphone avec cette page.
 *
 * Remplace le test par script console, qui ne s'exécutait
 * visiblement pas de façon fiable.
 */

export default function TestSTT() {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const controllerRef = useRef(null);

  async function handleStart() {
    setError("");
    setTranscript("");
    setStatus("recording");

    const voice = new VoiceInputController({
      onError: (err) => {
        setError(
          err?.message || String(err)
        );
        setStatus("idle");
      },
    });

    controllerRef.current = voice;

    try {
      await voice.start();
    } catch (err) {
      setError(
        err?.message || String(err)
      );
      setStatus("idle");
    }
  }

  async function handleStop() {
    if (!controllerRef.current) {
      return;
    }

    setStatus("processing");

    try {
      const text =
        await controllerRef.current.stop();

      setTranscript(
        text && text.trim()
          ? text
          : "(transcription vide -- aucun texte retourné)"
      );
    } catch (err) {
      setError(
        err?.message || String(err)
      );
    } finally {
      setStatus("idle");
      controllerRef.current = null;
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: 40,
        color: "white",
        background:
          "radial-gradient(circle at 50% 30%, #172b43 0%, #0b1220 70%)",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>
        Test isolé — nouveau système vocal
      </h1>

      <p
        style={{
          color: "rgba(242,239,233,0.6)",
          marginBottom: 32,
          maxWidth: 560,
        }}
      >
        Cette page n'utilise que{" "}
        <code>VoiceInputController</code> --
        aucune interférence possible avec le
        système d'écoute existant.
      </p>

      {status === "idle" && (
        <button
          onClick={handleStart}
          style={{
            fontSize: 18,
            padding: "14px 28px",
            borderRadius: 8,
            border: "none",
            background: "#5ab6d8",
            color: "#0b1220",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Démarrer l'enregistrement
        </button>
      )}

      {status === "recording" && (
        <button
          onClick={handleStop}
          style={{
            fontSize: 18,
            padding: "14px 28px",
            borderRadius: 8,
            border: "none",
            background: "#e2685f",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Arrêter et transcrire
        </button>
      )}

      {status === "processing" && (
        <p style={{ fontSize: 18, color: "#e2a45f" }}>
          Transcription en cours...
        </p>
      )}

      {transcript && (
        <div
          style={{
            marginTop: 32,
            padding: 20,
            maxWidth: 560,
            background: "rgba(90,182,216,0.1)",
            border: "1px solid rgba(90,182,216,0.3)",
            borderRadius: 8,
          }}
        >
          <strong>Texte transcrit :</strong>
          <p style={{ fontSize: 18, marginTop: 8 }}>
            {transcript}
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 32,
            padding: 20,
            maxWidth: 560,
            background: "rgba(226,104,95,0.12)",
            border: "1px solid rgba(226,104,95,0.4)",
            borderRadius: 8,
          }}
        >
          <strong style={{ color: "#e2685f" }}>
            Erreur :
          </strong>
          <p style={{ marginTop: 8 }}>{error}</p>
        </div>
      )}
    </div>
  );
}
