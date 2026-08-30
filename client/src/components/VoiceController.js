import { AvatarEngine } from "./AvatarEngine.js";
import { LipSyncController } from "./LipSyncController.js";

/**
 * VoiceController
 *
 * Contrôle la voix de Lyssia et synchronise :
 *
 * Audio
 *   ↓
 * AvatarEngine
 *   ↓
 * LipSyncController
 */
export class VoiceController {
  constructor(
    avatarEngine,
    lipSyncController
  ) {
    /**
     * Moteur comportemental de Lyssia.
     */
    this.avatarEngine =
      avatarEngine instanceof AvatarEngine
        ? avatarEngine
        : new AvatarEngine();

    /**
     * Contrôleur de synchronisation des lèvres.
     */
    this.lipSyncController =
      lipSyncController instanceof LipSyncController
        ? lipSyncController
        : new LipSyncController();

    /**
     * Audio actuellement en cours.
     */
    this.currentAudio = null;

    /**
     * Indique si Lyssia est en train de parler.
     */
    this.isSpeaking = false;

    /**
     * Indique si le contrôleur a été détruit.
     */
    this.destroyed = false;
  }

  /**
   * Joue un objet HTMLAudioElement.
   *
   * @param {HTMLAudioElement} audio
   */
  async speak(audio) {
    if (this.destroyed) {
      console.warn(
        "[Lyssia Voice] Controller destroyed"
      );

      return;
    }

    if (!(audio instanceof HTMLAudioElement)) {
      console.error(
        "[Lyssia Voice] Audio invalide."
      );

      return;
    }

    /**
     * Arrête l'audio précédent
     * avant d'en démarrer un nouveau.
     */
    this.stop();

    this.currentAudio = audio;

    /**
     * Début de la parole.
     */
    const handlePlay = () => {
      this.startSpeaking();
    };

    /**
     * Fin naturelle de l'audio.
     */
    const handleEnded = () => {
      this.stopSpeaking();
    };

    /**
     * Erreur audio.
     */
    const handleError = () => {
      console.error(
        "[Lyssia Voice] Erreur audio."
      );

      this.stopSpeaking();
    };

    audio.addEventListener(
      "play",
      handlePlay
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    audio.addEventListener(
      "error",
      handleError
    );

    /**
     * Sauvegarde des handlers
     * pour le nettoyage.
     */
    this.audioHandlers = {
      handlePlay,
      handleEnded,
      handleError
    };

    try {
      await audio.play();
    } catch (error) {
      console.error(
        "[Lyssia Voice] Impossible de lire l'audio.",
        error
      );

      this.stopSpeaking();
    }
  }

  /**
   * Démarre le comportement vocal.
   */
  startSpeaking() {
    if (this.isSpeaking) {
      return;
    }

    this.isSpeaking = true;

    console.log(
      "[Lyssia Voice] Début de la parole"
    );

    this.avatarEngine.startSpeaking();

    this.lipSyncController.start();
  }

  /**
   * Arrête le comportement vocal.
   */
  stopSpeaking() {
    if (!this.isSpeaking) {
      return;
    }

    this.isSpeaking = false;

    console.log(
      "[Lyssia Voice] Fin de la parole"
    );

    this.lipSyncController.stop();

    this.avatarEngine.stopSpeaking();

    this.cleanupAudioListeners();

    this.currentAudio = null;
  }

  /**
   * Arrête la voix manuellement.
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();

      this.currentAudio.currentTime = 0;
    }

    this.stopSpeaking();
  }

  /**
   * Met la voix en pause.
   */
  pause() {
    if (!this.currentAudio) {
      return;
    }

    this.currentAudio.pause();

    this.lipSyncController.stop();

    this.avatarEngine.idle();

    this.isSpeaking = false;

    console.log(
      "[Lyssia Voice] Pause"
    );
  }

  /**
   * Reprend la lecture.
   */
  async resume() {
    if (!this.currentAudio) {
      return;
    }

    try {
      await this.currentAudio.play();
    } catch (error) {
      console.error(
        "[Lyssia Voice] Impossible de reprendre l'audio.",
        error
      );
    }
  }

  /**
   * Vérifie si Lyssia parle actuellement.
   */
  getIsSpeaking() {
    return this.isSpeaking;
  }

  /**
   * Supprime les événements audio.
   */
  cleanupAudioListeners() {
    if (
      !this.currentAudio ||
      !this.audioHandlers
    ) {
      return;
    }

    const {
      handlePlay,
      handleEnded,
      handleError
    } = this.audioHandlers;

    this.currentAudio.removeEventListener(
      "play",
      handlePlay
    );

    this.currentAudio.removeEventListener(
      "ended",
      handleEnded
    );

    this.currentAudio.removeEventListener(
      "error",
      handleError
    );

    this.audioHandlers = null;
  }

  /**
   * Réinitialise complètement le contrôleur.
   */
  reset() {
    this.stop();

    this.avatarEngine.reset();

    this.lipSyncController.reset();
  }

  /**
   * Nettoyage complet.
   */
  destroy() {
    this.stop();

    this.cleanupAudioListeners();

    this.destroyed = true;

    console.log(
      "[Lyssia Voice] Controller destroyed"
    );
  }
}