/**
 * =====================================================
 * LYSSIA OS
 * Module : Voice Engine
 * Version : 1.4
 * =====================================================
 *
 * Gestion :
 *  - synthèse vocale
 *  - interruption de la synthèse
 *  - reconnaissance vocale
 *  - sessions d'écoute
 * =====================================================
 */

let activeUtterance = null;
let activeSpeechToken = 0;
let activeSpeechResolve = null;


/* =====================================================
   SYNTHÈSE VOCALE
   ===================================================== */

export function isVoiceSupported() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}


/* =====================================================
   ARRÊT DE LA PAROLE
   ===================================================== */

export function stopSpeaking() {
  if (!isVoiceSupported()) {
    return;
  }

  /*
   * Invalide immédiatement l'ancienne parole.
   */
  activeSpeechToken += 1;

  /*
   * Libère la Promise éventuellement en attente.
   */
  if (activeSpeechResolve) {
    const resolve = activeSpeechResolve;

    activeSpeechResolve = null;
    resolve();
  }

  activeUtterance = null;

  /*
   * Annule toute la file vocale.
   *
   * IMPORTANT :
   * on ne fait PAS pause() / resume() ici.
   * Cela peut provoquer des comportements incohérents
   * selon le navigateur.
   */
  window.speechSynthesis.cancel();
}


/* =====================================================
   PARLER
   ===================================================== */

export function speak(text, options = {}) {
  return new Promise((resolve, reject) => {
    if (!isVoiceSupported()) {
      reject(
        new Error(
          "La synthèse vocale n'est pas disponible dans ce navigateur."
        )
      );

      return;
    }

    if (!text || !text.trim()) {
      resolve();

      return;
    }

    /*
     * Une nouvelle parole annule toujours la précédente.
     */
    stopSpeaking();

    const speechToken = activeSpeechToken;

    const {
      language = "fr-FR",
      rate = 1,
      pitch = 1,
      volume = 1,
    } = options;

    const utterance =
      new SpeechSynthesisUtterance(text);

    activeUtterance = utterance;
    activeSpeechResolve = resolve;

    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const voices =
      window.speechSynthesis.getVoices();

    const frenchVoice = voices.find(
      (voice) =>
        voice.lang &&
        voice.lang
          .toLowerCase()
          .startsWith("fr")
    );

    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onstart = () => {
      /*
       * Cette utterance n'est plus valide :
       * elle a été interrompue.
       */
      if (
        activeUtterance !== utterance ||
        activeSpeechToken !== speechToken
      ) {
        return;
      }

      if (options.onStart) {
        options.onStart();
      }
    };

    utterance.onend = () => {
      console.log(
    "🎙️ Lyssia — voix terminée",
    text
    );
      const isActive =
        activeUtterance === utterance &&
        activeSpeechToken === speechToken;

      if (!isActive) {
        return;
      }

      activeUtterance = null;
      activeSpeechResolve = null;

      if (options.onEnd) {
        options.onEnd();
      }

      resolve();
    };

    utterance.onerror = (event) => {
      console.error(
      "🎙️ Lyssia — erreur vocale :",
      event
    );
      const isActive =
        activeUtterance === utterance &&
        activeSpeechToken === speechToken;

      /*
       * Une interruption volontaire n'est pas une erreur.
       */
      if (
        event?.error === "canceled" ||
        event?.error === "interrupted"
      ) {
        if (isActive) {
          activeUtterance = null;
          activeSpeechResolve = null;
        }

        resolve();

        return;
      }

      if (!isActive) {
        resolve();

        return;
      }

      activeUtterance = null;
      activeSpeechResolve = null;

      if (options.onError) {
        options.onError(event);
      }

      reject(event);
    };

    window.speechSynthesis.speak(
      utterance
    );
  });
}


/* =====================================================
   RECONNAISSANCE VOCALE
   ===================================================== */

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null
  );
}

export function isListeningSupported() {
  return Boolean(
    getSpeechRecognitionConstructor()
  );
}


/* =====================================================
   SESSION D'ÉCOUTE
   ===================================================== */

export function createListeningSession(
  options = {}
) {
  const SpeechRecognition =
    getSpeechRecognitionConstructor();

  if (!SpeechRecognition) {
    throw new Error(
      "La reconnaissance vocale n'est pas disponible dans ce navigateur."
    );
  }

  const {
    language = "fr-FR",
    continuous = false,
    interimResults = true,

    onStart,
    onInterimResult,
    onFinalResult,
    onEnd,
    onError,
  } = options;

  const recognition =
    new SpeechRecognition();

  recognition.lang = language;
  recognition.continuous = continuous;
  recognition.interimResults =
    interimResults;

  recognition.maxAlternatives = 1;

  let finalText = "";
  let stopped = false;

  recognition.onstart = () => {
    if (onStart) {
      onStart();
    }
  };

  recognition.onresult = (event) => {
    let interimText = "";

    for (
      let index = event.resultIndex;
      index < event.results.length;
      index += 1
    ) {
      const result =
        event.results[index];

      const transcript =
        result[0]?.transcript || "";

      if (result.isFinal) {
        finalText += `${transcript} `;
      } else {
        interimText += transcript;
      }
    }

    if (
      interimText.trim() &&
      onInterimResult
    ) {
      onInterimResult(
        interimText.trim()
      );
    }

    if (
      finalText.trim() &&
      onFinalResult
    ) {
      onFinalResult(
        finalText.trim()
      );
    }
  };

  recognition.onerror = (event) => {
    if (onError) {
      onError(event);
    }
  };

  recognition.onend = () => {
    if (onEnd) {
      onEnd({
        text: finalText.trim(),
        stopped,
      });
    }
  };

  function start() {
    stopped = false;

    try {
      recognition.start();
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  }

  function stop() {
    stopped = true;

    try {
      recognition.stop();
    } catch (error) {
      console.warn(
        "Impossible d'arrêter la reconnaissance vocale :",
        error
      );
    }
  }

  function abort() {
    stopped = true;

    try {
      recognition.abort();
    } catch (error) {
      console.warn(
        "Impossible d'interrompre la reconnaissance vocale :",
        error
      );
    }
  }

  return {
    start,
    stop,
    abort,
  };
}


/* =====================================================
   API COMPATIBLE
   ===================================================== */

export function startListening(
  options = {}
) {
  return new Promise(
    (resolve, reject) => {
      if (!isListeningSupported()) {
        reject(
          new Error(
            "La reconnaissance vocale n'est pas disponible dans ce navigateur."
          )
        );

        return;
      }

      let resolved = false;

      const session =
        createListeningSession({
          ...options,

          interimResults: false,

          onStart: options.onStart,

          onFinalResult: (text) => {
            if (options.onResult) {
              options.onResult({
                finalText: text,
                interimText: "",
              });
            }

            if (!resolved && text) {
              resolved = true;
              resolve(text);
            }
          },

          onEnd: (result) => {
            if (options.onEnd) {
              options.onEnd(result);
            }

            if (
              !resolved &&
              result.text
            ) {
              resolved = true;
              resolve(result.text);
            }
          },

          onError: (error) => {
            if (options.onError) {
              options.onError(error);
            }

            if (!resolved) {
              resolved = true;
              reject(error);
            }
          },
        });

      session.start();
    }
  );
}


/* =====================================================
   ARRÊT D'UNE SESSION D'ÉCOUTE
   ===================================================== */

export function stopListening(session) {
  if (!session) {
    return;
  }

  if (
    typeof session.stop === "function"
  ) {
    session.stop();
  }
}