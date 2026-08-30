import { AvatarState } from "./AvatarState.js";

/**
 * AvatarEngine
 *
 * Moteur central de comportement de l'avatar Lyssia.
 *
 * États :
 * - IDLE
 * - LISTENING
 * - THINKING
 * - SPEAKING
 */
export class AvatarEngine {
  constructor() {
    /**
     * État actuel de l'avatar.
     */
    this.state = AvatarState.IDLE;

    /**
     * Liste des composants abonnés
     * aux changements d'état.
     */
    this.listeners = [];
  }

  /**
   * Retourne l'état actuel.
   */
  getState() {
    return this.state;
  }

  /**
   * Modifie l'état actuel de l'avatar.
   */
  setState(newState) {
    if (this.state === newState) {
      return;
    }

    const previousState = this.state;

    this.state = newState;

    console.log(
      `[Lyssia Avatar] ${previousState} → ${newState}`
    );

    this.notifyListeners(
      previousState,
      newState
    );
  }

  /**
   * Abonne un composant aux changements d'état.
   *
   * Retourne une fonction permettant
   * de se désabonner.
   */
  subscribe(listener) {
    this.listeners.push(listener);

    return () => {
      this.unsubscribe(listener);
    };
  }

  /**
   * Désabonne un listener.
   */
  unsubscribe(listener) {
    this.listeners = this.listeners.filter(
      (item) => item !== listener
    );
  }

  /**
   * Notifie tous les listeners.
   */
  notifyListeners(
    previousState,
    newState
  ) {
    this.listeners.forEach((listener) => {
      listener(
        previousState,
        newState
      );
    });
  }

  // ============================================================
  // COMMANDES DE COMPORTEMENT
  // ============================================================

  /**
   * Lyssia revient au repos.
   */
  idle() {
    this.setState(
      AvatarState.IDLE
    );
  }

  /**
   * Lyssia commence à écouter.
   */
  startListening() {
    this.setState(
      AvatarState.LISTENING
    );
  }

  /**
   * Lyssia termine son écoute
   * et commence à réfléchir.
   */
  stopListening() {
    this.setState(
      AvatarState.THINKING
    );
  }

  /**
   * Lyssia commence à réfléchir.
   */
  startThinking() {
    this.setState(
      AvatarState.THINKING
    );
  }

  /**
   * Lyssia termine sa réflexion.
   */
  stopThinking() {
    this.setState(
      AvatarState.IDLE
    );
  }

  /**
   * Lyssia commence à parler.
   */
  startSpeaking() {
    this.setState(
      AvatarState.SPEAKING
    );
  }

  /**
   * Lyssia termine de parler.
   */
  stopSpeaking() {
    this.setState(
      AvatarState.IDLE
    );
  }

  // ============================================================
  // UTILITAIRES
  // ============================================================

  /**
   * Vérifie si Lyssia parle.
   */
  isSpeaking() {
    return (
      this.state === AvatarState.SPEAKING
    );
  }

  /**
   * Vérifie si Lyssia écoute.
   */
  isListening() {
    return (
      this.state === AvatarState.LISTENING
    );
  }

  /**
   * Vérifie si Lyssia réfléchit.
   */
  isThinking() {
    return (
      this.state === AvatarState.THINKING
    );
  }

  /**
   * Vérifie si Lyssia est au repos.
   */
  isIdle() {
    return (
      this.state === AvatarState.IDLE
    );
  }

  /**
   * Réinitialise l'avatar.
   */
  reset() {
    this.setState(
      AvatarState.IDLE
    );
  }

  /**
   * Nettoyage du moteur.
   */
  destroy() {
    this.listeners = [];

    this.state = AvatarState.IDLE;

    console.log(
      "[Lyssia Avatar] Engine destroyed"
    );
  }
}