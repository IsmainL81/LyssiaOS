/**
 * =====================================================
 * LYSSIA OS
 * Module : AI Engine
 * Version : 1.0
 * =====================================================
 */

const API_URL =
  "http://localhost:3001/api/chat";

const MEMORY_EXTRACT_URL =
  "http://localhost:3001/api/memory/extract";

/**
 * =====================================================
 * CONVERSATION AVEC LYSSIA
 * =====================================================
 */

export async function askLyssia(
  message,
  cognitiveContext = null
) {
  if (
    !message ||
    !message.trim()
  ) {
    throw new Error(
      "Message vide."
    );
  }

  const response =
    await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
      message:
      message.trim(),

      cognitiveContext,
    }),
    });

  if (!response.ok) {
    let errorMessage =
      `Erreur du serveur Lyssia : ${response.status}`;

    try {
      const data =
        await response.json();

      if (data?.error) {
        errorMessage =
          data.error;
      }
    } catch {
      // La réponse du serveur
      // n'est pas au format JSON.
    }

    throw new Error(
      errorMessage
    );
  }

  const data =
    await response.json();

  if (
    !data?.reply ||
    !data.reply.trim()
  ) {
    throw new Error(
      "Le serveur Lyssia n'a retourné aucune réponse."
    );
  }

  return data.reply;
}

/**
 * =====================================================
 * EXTRACTION DE MÉMOIRE SÉMANTIQUE
 * =====================================================
 */

export async function askMemoryExtraction(
  userMessage,
  assistantResponse
) {
  const response =
    await fetch(MEMORY_EXTRACT_URL, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        userMessage,
        assistantResponse,
      }),
    });

  if (!response.ok) {
    throw new Error(
      `Erreur du serveur Lyssia (extraction) : ${response.status}`
    );
  }

  const data =
    await response.json();

  return data.facts;
}
