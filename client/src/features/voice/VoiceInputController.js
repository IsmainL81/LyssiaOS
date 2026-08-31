import {
  startRecording,
  stopRecording,
  transcribe,
} from "./STTProvider.js";

/**
 * Contrôleur d'entrée vocale de Lyssia.
 *
 * Une session = un clic pour démarrer,
 * puis un clic pour arrêter.
 */
export class VoiceInputController {
  constructor({
    onTranscript = null,
    onStart = null,
    onStop = null,
    onError = null,
  } = {}) {
    this.recorder = null;
    this.active = false;

    this.onTranscript =
      typeof onTranscript === "function"
        ? onTranscript
        : null;

    this.onStart =
      typeof onStart === "function"
        ? onStart
        : null;

    this.onStop =
      typeof onStop === "function"
        ? onStop
        : null;

    this.onError =
      typeof onError === "function"
        ? onError
        : null;
  }

  async start() {
    if (this.active) {
      return;
    }

    try {
      this.recorder =
        await startRecording();

      this.recorder.start();
      this.active = true;

      console.log(
        "[Lyssia VoiceInput] Recording started"
      );

      this.onStart?.();
    } catch (error) {
      this.recorder = null;
      this.active = false;

      console.error(
        "[Lyssia VoiceInput] Start error:",
        error
      );

      this.onError?.(error);

      throw error;
    }
  }

  async stop() {
    if (!this.recorder) {
      return "";
    }

    const recorder =
      this.recorder;

    try {
      const audio =
        await stopRecording(recorder);

      this.recorder = null;
      this.active = false;

      if (
        !audio ||
        audio.size === 0
      ) {
        this.onStop?.("");

        return "";
      }

      const text =
        await transcribe(audio);

      console.log(
        "[Lyssia VoiceInput] Transcription:",
        text
      );

      this.onStop?.(text);

      if (text) {
        await this.onTranscript?.(text);
      }

      return text;
    } catch (error) {
      this.recorder = null;
      this.active = false;

      console.error(
        "[Lyssia VoiceInput] Error:",
        error
      );

      this.onError?.(error);

      throw error;
    }
  }

  isActive() {
    return this.active;
  }

  cancel() {
    const recorder =
      this.recorder;

    this.recorder = null;
    this.active = false;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }
  }
}