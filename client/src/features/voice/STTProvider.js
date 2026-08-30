/**
 * =====================================================
 * LYSSIA OS
 * Module : Dedicated Speech-to-Text Provider
 * =====================================================
 */

const STT_ENDPOINT = "http://localhost:3001/api/voice/transcribe";

/**
 * Enregistre depuis le microphone jusqu'à stopRecording().
 *
 * @returns {Promise<MediaRecorder>} recorder
 */
export async function startRecording() {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    throw new Error(
      "L'accès au microphone n'est pas disponible."
    );
  }

  const stream =
    await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

  let mimeType = "";

  if (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
  ) {
    mimeType = "audio/webm;codecs=opus";
  } else if (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("audio/webm")
  ) {
    mimeType = "audio/webm";
  }

  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);

  recorder._lyssiaChunks = [];
  recorder._lyssiaStream = stream;

  recorder.ondataavailable = (event) => {
    if (event.data?.size > 0) {
      recorder._lyssiaChunks.push(event.data);
    }
  };

  return recorder;
}

/**
 * Arrête l'enregistrement et récupère l'audio.
 *
 * @param {MediaRecorder} recorder
 * @returns {Promise<Blob>}
 */
export function stopRecording(recorder) {
  return new Promise((resolve, reject) => {
    if (!(recorder instanceof MediaRecorder)) {
      reject(
        new Error("Enregistreur audio invalide.")
      );
      return;
    }

    recorder.onstop = () => {
      try {
        const blob = new Blob(
          recorder._lyssiaChunks || [],
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          }
        );

        recorder._lyssiaStream
          ?.getTracks()
          .forEach((track) => track.stop());

        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };

    recorder.onerror = (event) => {
      recorder._lyssiaStream
        ?.getTracks()
        .forEach((track) => track.stop());

      reject(
        event.error ||
          new Error(
            "Erreur pendant l'enregistrement audio."
          )
      );
    };

    if (recorder.state !== "inactive") {
      recorder.stop();
    } else {
      recorder._lyssiaStream
        ?.getTracks()
        .forEach((track) => track.stop());

      resolve(
        new Blob(
          recorder._lyssiaChunks || [],
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          }
        )
      );
    }
  });
}

/**
 * Envoie l'audio au backend STT.
 *
 * @param {Blob} audioBlob
 * @returns {Promise<string>}
 */
export async function transcribe(audioBlob) {
  if (!(audioBlob instanceof Blob)) {
    throw new Error(
      "Audio invalide pour la transcription."
    );
  }

  if (audioBlob.size === 0) {
    throw new Error(
      "L'enregistrement audio est vide."
    );
  }

  const formData = new FormData();

  formData.append(
    "audio",
    audioBlob,
    "lyssia-voice.webm"
  );

  const response = await fetch(
    STT_ENDPOINT,
    {
      method: "POST",
      body: formData,
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Erreur STT HTTP ${response.status}.`
    );
  }

  return String(
    data?.text || ""
  ).trim();
}