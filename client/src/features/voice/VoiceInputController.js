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
  constructor() {
    this.recorder = null;
    this.active = false;
  }

  async start() {
    if (this.active) {
      return;
    }

    this.recorder = await startRecording();
    this.recorder.start();
    this.active = true;

    console.log(
      "[Lyssia VoiceInput] Recording started"
    );
  }

  async stop() {
    if (!this.recorder) {
      return "";
    }

    const recorder = this.recorder;

    try {
      const audio = await stopRecording(recorder);

      this.recorder = null;
      this.active = false;

      if (!audio || audio.size === 0) {
        return "";
      }

      const text = await transcribe(audio);

      console.log(
        "[Lyssia VoiceInput] Transcription:",
        text
      );

      return text;
    } catch (error) {
      this.recorder = null;
      this.active = false;

      console.error(
        "[Lyssia VoiceInput] Error:",
        error
      );

      throw error;
    }
  }

  isActive() {
    return this.active;
  }

  cancel() {
    const recorder = this.recorder;

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