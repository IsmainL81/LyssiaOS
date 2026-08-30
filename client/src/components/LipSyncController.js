/**
 * États possibles du système de synchronisation labiale.
 */
export const LipSyncState = {
  IDLE: "IDLE",
  SPEAKING: "SPEAKING"
};


/**
 * LipSyncController
 *
 * Gère l'état du mouvement des lèvres de Lyssia.
 *
 * V1 :
 *
 * IDLE
 *   ↓
 * start()
 *   ↓
 * SPEAKING
 *   ↓
 * stop()
 *   ↓
 * IDLE
 */
export class LipSyncController {

  constructor() {
    /**
     * État actuel du lip-sync.
     */
    this.state = LipSyncState.IDLE;

    /**
     * Liste des composants abonnés.
     */
    this.listeners = [];
  }


  /**
   * Retourne l'état actuel du lip-sync.
   */
  getState() {
    return this.state;
  }


  /**
   * Modifie l'état actuel.
   */
  setState(newState) {

    if (this.state === newState) {
      return;
    }

    const previousState = this.state;

    this.state = newState;

    console.log(
      `[Lyssia LipSync] ${previousState} → ${newState}`
    );

    this.notifyListeners(
      previousState,
      newState
    );
  }


  /**
   * Active le mouvement des lèvres.
   */
  start() {

    this.setState(
      LipSyncState.SPEAKING
    );

  }


  /**
   * Arrête le mouvement des lèvres.
   */
  stop() {

    this.setState(
      LipSyncState.IDLE
    );

  }


  /**
   * Vérifie si le lip-sync est actif.
   */
  isSpeaking() {

    return (
      this.state === LipSyncState.SPEAKING
    );

  }


  /**
   * Abonne un composant aux changements d'état.
   *
   * @param {Function} listener
   *
   * @returns {Function}
   */
  subscribe(listener) {

    this.listeners.push(listener);

    /**
     * Fonction de désabonnement.
     */
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
   * Notifie tous les composants abonnés.
   */
  notifyListeners(
    previousState,
    newState
  ) {

    this.listeners.forEach(
      (listener) => {

        listener(
          previousState,
          newState
        );

      }
    );

  }


  /**
   * Réinitialise le contrôleur.
   */
  reset() {

    this.setState(
      LipSyncState.IDLE
    );

  }


  /**
   * Nettoie complètement le contrôleur.
   */
  destroy() {

    this.listeners = [];

    this.state =
      LipSyncState.IDLE;

    console.log(
      "[Lyssia LipSync] Controller destroyed"
    );

  }

}