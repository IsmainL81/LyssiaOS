/**
 * =====================================================
 * LYSSIA OS
 * Module : AI Engine
 * Version : 1.0
 * =====================================================
 */

const API_URL =
  "http://localhost:3001/api/chat";

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
