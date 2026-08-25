/**
 * =====================================================
 * LYSSIA OS
 * Module : Voice Engine
 * Version : 1.5
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
   NETTOYAGE DU TEXTE (markdown -> texte parlable)
   ===================================================== */

function cleanSpeechText(text = "") {
  return String(text)
    .replace(/[`*_#>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* =====================================================
   DÉCOUPAGE DU TEXTE
   ===================================================== */

/* =====================================================
   PROSODIE PAR MORCEAU
   =====================================================
   Variation légère de rate/pitch selon la ponctuation de
   fin de morceau, pour éviter une intonation identique et
   plate sur chaque phrase. Les valeurs restent proches de
   1 -- l'objectif est une nuance perceptible, pas un effet
   robotique inverse.
   ===================================================== */

function getChunkProsody(chunk) {
  const trimmed = String(chunk).trim();
  const lastChar = trimmed.slice(-1);

  // Légère variation aléatoire pour éviter un débit
  // parfaitement identique morceau après morceau.
  const microVariation = () =>
    1 + (Math.random() * 0.04 - 0.02);

  if (lastChar === "?") {
    return { rate: 1.0 * microVariation(), pitch: 1.08 };
  }

  if (lastChar === "!") {
    return { rate: 1.08 * microVariation(), pitch: 1.06 };
  }

  return { rate: 1.0 * microVariation(), pitch: 1.0 };
}


function splitSpeechText(text = "") {
  const cleanText = String(text)
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) {
    return [];
  }

  const sentences =
    cleanText.match(
      /[^.!?\u2026]+(?:[.!?\u2026]+|$)/g
    ) || [cleanText];

  const chunks = [];
  const MAX_CHUNK_LENGTH = 450;

  for (const sentence of sentences) {
    const chunk = sentence.trim();

    if (!chunk) {
      continue;
    }

    if (chunk.length <= MAX_CHUNK_LENGTH) {
      chunks.push(chunk);
      continue;
    }

    const parts = chunk.split(
      /(?<=[,;:])\s+/
    );

    let current = "";

    for (const part of parts) {
      const piece = part.trim();

      if (!piece) {
        continue;
      }

      const candidate = current
        ? `${current} ${piece}`
        : piece;

      if (candidate.length <= MAX_CHUNK_LENGTH) {
        current = candidate;
      } else {
        if (current) {
          chunks.push(current);
        }

        current = piece;
      }
    }

    if (current) {
      chunks.push(current);
    }
  }

  return chunks;
}


/* =====================================================
   ARRÊT DE LA PAROLE
   ===================================================== */

export function stopSpeaking() {
  if (!isVoiceSupported()) {
    return;
  }

  /*
   * Invalide immédiatement la session active.
   */
  activeSpeechToken += 1;

  /*
   * Libère la Promise en attente.
   */
  if (activeSpeechResolve) {
    const resolve =
      activeSpeechResolve;

    activeSpeechResolve = null;

    resolve();
  }

  activeUtterance = null;

  /*
   * Arrêt physique du moteur vocal.
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
     * Une nouvelle demande invalide simplement
     * la précédente.
     *
     * IMPORTANT :
     * aucun cancel() ici.
     * L'arrêt physique est réservé à stopSpeaking().
     */
    activeSpeechToken += 1;

    const speechToken = activeSpeechToken;

    const {
      language = "fr-FR",
      rate: explicitRate,
      pitch: explicitPitch,
      volume = 1,
    } = options;

    const speechText = cleanSpeechText(text);
    const chunks = splitSpeechText(speechText);

    if (!chunks.length) {
      resolve();
      return;
    }

    let chunkIndex = 0;
    let firstChunk = true;
    let finished = false;

    activeSpeechResolve = resolve;

    /*
     * =====================================================
     * VOIX
     * =====================================================
     */

    function getFrenchVoice() {
      const voices =
        window.speechSynthesis.getVoices();

      return (
        voices.find(
          (voice) =>
            voice.name ===
            "Google français"
        ) ||
        voices.find(
          (voice) =>
            voice.lang &&
            voice.lang
              .toLowerCase()
              .startsWith("fr-fr") &&
            voice.localService === false
        ) ||
        voices.find(
          (voice) =>
            voice.lang &&
            voice.lang
              .toLowerCase()
              .startsWith("fr")
        )
      );
    }

    /*
     * =====================================================
     * FIN
     * =====================================================
     */

    function finish() {
      if (finished) {
        return;
      }

      finished = true;

      activeUtterance = null;
      activeSpeechResolve = null;

      if (options.onEnd) {
        options.onEnd();
      }

      resolve();
    }

    /*
     * =====================================================
     * ERREUR
     * =====================================================
     */

    function fail(error) {
      if (finished) {
        return;
      }

      finished = true;

      activeUtterance = null;
      activeSpeechResolve = null;

      if (options.onError) {
        options.onError(error);
      }

      reject(error);
    }

    /*
     * =====================================================
     * MORCEAU SUIVANT
     * =====================================================
     */

    function speakNext() {
      /*
       * La demande n'est plus active.
       */
      if (
        speechToken !==
        activeSpeechToken
      ) {
        return;
      }

      /*
       * Tous les morceaux sont terminés.
       */
      if (
        chunkIndex >=
        chunks.length
      ) {
        finish();
        return;
      }

      const chunk =
        chunks[chunkIndex];

      const autoProsody =
        getChunkProsody(chunk);

      const utterance =
        new SpeechSynthesisUtterance(
          chunk
        );

      activeUtterance =
        utterance;

      utterance.lang =
        language;

      utterance.rate =
        explicitRate ??
        autoProsody.rate;

      utterance.pitch =
        explicitPitch ??
        autoProsody.pitch;

      utterance.volume =
        volume;

      const frenchVoice =
        getFrenchVoice();

      if (frenchVoice) {
        utterance.voice =
          frenchVoice;
      }

      /*
       * ===================================================
       * START
       * ===================================================
       */

      utterance.onstart = () => {
        if (
          speechToken !==
          activeSpeechToken
        ) {
          return;
        }

        if (
          firstChunk &&
          options.onStart
        ) {
          firstChunk = false;
          options.onStart();
        }
      };

      /*
       * ===================================================
       * END
       * ===================================================
       */

      utterance.onend = () => {
        if (
          speechToken !==
          activeSpeechToken
        ) {
          return;
        }

        activeUtterance =
          null;

        chunkIndex += 1;

        /*
         * Aucun cancel() ici.
         *
         * On laisse SpeechSynthesis
         * enchaîner naturellement.
         */
        speakNext();
      };

      /*
       * ===================================================
       * ERROR
       * ===================================================
       */

      utterance.onerror = (
        event
      ) => {
        if (
          speechToken !==
          activeSpeechToken
        ) {
          return;
        }

        /*
         * Une interruption volontaire
         * provoquée par stopSpeaking()
         * ne doit pas être traitée comme
         * une erreur applicative.
         */
        if (
          event?.error ===
            "canceled" ||
          event?.error ===
            "interrupted"
        ) {
          activeUtterance =
            null;

          return;
        }

        console.error(
          "Lyssia VoiceEngine - erreur de synthèse :",
          event?.error
        );

        fail(event);
      };

      /*
       * ===================================================
       * LANCEMENT
       * ===================================================
       */

      window.speechSynthesis.speak(
        utterance
      );
    }

    /*
     * Premier morceau.
     */
    speakNext();
  });
}


/* =====================================================
   RECONNAISSANCE VOCALE
   ===================================================== */

/*
 * Correction de noms propres mal reconnus. "Lyssia" est un
 * nom invente, absent du modele de langage du reconnaisseur
 * (base sur des mots courants), qui le remplace par le nom
 * courant le plus proche phonetiquement -- observe : "Alicia".
 * SpeechGrammarList (biais de vocabulaire cote navigateur) est
 * officiellement deprecie et sans effet reel, donc la correction
 * se fait ici, en aval, sur le texte transcrit.
 */
const NAME_CORRECTIONS = [
  { pattern: /\balicia\b/gi, replacement: "Lyssia" },
  { pattern: /\balyssia\b/gi, replacement: "Lyssia" },
  { pattern: /\balyssa\b/gi, replacement: "Lyssia" },
];

function correctKnownMishearings(text = "") {
  let corrected = String(text);

  for (const { pattern, replacement } of NAME_CORRECTIONS) {
    corrected = corrected.replace(
      pattern,
      replacement
    );
  }

  return corrected;
}

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
    onSpeechActivity,
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

  let processedResultCount = 0;
  let lastFinalText = "";
  let stopped = false;

  recognition.onstart = () => {
    if (onStart) {
      onStart();
    }
  };

  recognition.onresult = (event) => {
    let interimText = "";

    /*
     * On parcourt TOUS les résultats depuis 0, sans faire
     * confiance à event.resultIndex : rien ne garantit
     * qu'il exclue systématiquement les résultats déjà
     * traités. La protection réelle est processedResultCount,
     * pisté nous-mêmes -- un résultat final n'est envoyé
     * qu'une seule fois, jamais réaccumulé, même si le
     * navigateur le re-présente dans un événement ultérieur.
     */

    for (
      let index = 0;
      index < event.results.length;
      index += 1
    ) {
      const result =
        event.results[index];

      const transcript =
        correctKnownMishearings(
          result[0]?.transcript || ""
        );

      if (
        transcript.trim() &&
        onSpeechActivity
      ) {
        onSpeechActivity(
          transcript.trim()
        );
      }

      if (result.isFinal) {
        if (
          index >= processedResultCount &&
          transcript.trim() &&
          onFinalResult
        ) {
          lastFinalText =
            transcript.trim();

          onFinalResult(
            transcript.trim()
          );
        }

        processedResultCount =
          Math.max(
            processedResultCount,
            index + 1
          );
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
  };

  recognition.onerror = (event) => {
    if (onError) {
      onError(event);
    }
  };

  recognition.onend = () => {
    if (onEnd) {
      onEnd({
        text: lastFinalText,
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
