/**
 * =====================================================
 * LYSSIA OS
 * Module : Vision Engine
 * Version : 1.0
 * =====================================================
 */

const API_URL =
  "http://localhost:3001/api/vision";

/**
 * =====================================================
 * ANALYSE D'IMAGE
 * =====================================================
 *
 * Analyse une image avec la vision de Lyssia.
 *
 * @param {string} image
 * @param {string} prompt
 * @returns {Promise<string>}
 */

export async function analyzeImage(
  image,
  prompt =
    "Décris ce que tu vois dans cette image."
) {
  if (!image) {
    throw new Error(
      "Aucune image à analyser."
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
        image,
        prompt,
      }),
    });

  if (!response.ok) {
    let message =
      `Erreur VisionEngine : ${response.status}`;

    try {
      const data =
        await response.json();

      if (data?.error) {
        message = data.error;
      }
    } catch {
      // Réponse non JSON.
    }

    throw new Error(message);
  }

  const data =
    await response.json();

  if (
    !data?.reply ||
    !data.reply.trim()
  ) {
    throw new Error(
      "Le serveur Vision n'a retourné aucune réponse."
    );
  }

  return data.reply;
}