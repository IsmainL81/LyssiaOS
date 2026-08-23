/**
 * =====================================================
 * LYSSIA OS
 * Module : AI Engine
 * Version : 2.0 (streaming)
 * =====================================================
 */

const API_URL =
  "http://localhost:3001/api/chat";

/**
 * =====================================================
 * CONVERSATION AVEC LYSSIA
 * =====================================================
 * onDelta (optionnel) : callback(delta, fullTextSoFar)
 * appele a chaque fragment recu. Non fourni -> comportement
 * identique a l'ancienne version non-streamee : on attend
 * la fin et on retourne le texte complet.
 */

export async function askLyssia(
  message,
  cognitiveContext = null,
  onDelta = null
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

  /*
   * Lecture du flux SSE. Chaque evenement est de la forme
   * "data: {...json...}\n\n" -- on decoupe le buffer sur
   * ce separateur, en gardant le fragment incomplet pour
   * la prochaine lecture.
   */
  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";
  let fullText = "";
  let streamError = null;

  while (true) {
    const { done, value } =
      await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(
      value,
      { stream: true }
    );

    const events =
      buffer.split("\n\n");

    buffer = events.pop() || "";

    for (const rawEvent of events) {
      const line =
        rawEvent.trim();

      if (
        !line.startsWith("data: ")
      ) {
        continue;
      }

      const jsonStr =
        line.slice(6);

      let parsed;

      try {
        parsed =
          JSON.parse(jsonStr);
      } catch {
        continue;
      }

      if (parsed.error) {
        streamError =
          parsed.error;

        continue;
      }

      if (parsed.delta) {
        fullText +=
          parsed.delta;

        if (onDelta) {
          onDelta(
            parsed.delta,
            fullText
          );
        }
      }

      if (
        parsed.done &&
        parsed.fullText
      ) {
        fullText =
          parsed.fullText;
      }
    }
  }

  if (streamError) {
    throw new Error(
      streamError
    );
  }

  if (
    !fullText ||
    !fullText.trim()
  ) {
    throw new Error(
      "Le serveur Lyssia n'a retourné aucune réponse."
    );
  }

  return fullText;
}
