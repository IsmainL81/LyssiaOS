/**
 * États d'animation de Lyssia.
 */
export const AnimationState = {
  IDLE: "IDLE",
  BLINK: "BLINK",
  HEAD_MOVE: "HEAD_MOVE",
  SPEAKING: "SPEAKING",
  THINKING: "THINKING"
};


/**
 * AnimationController
 *
 * Gère les animations comportementales de Lyssia.
 *
 * Ce contrôleur ne dessine pas directement
 * les animations.
 *
 * Il informe simplement les composants
 * visuels qu'une animation doit être jouée.
 */
export class AnimationController {

  constructor() {

    /**
     * État actuel de l'animation.
     */
    this.state =
      AnimationState.IDLE;


    /**
     * Composants abonnés.
     */
    this.listeners = [];


    /**
     * Intervalle de clignement.
     */
    this.blinkTimeout = null;


    /**
     * Intervalle de micro-mouvements.
     */
    this.headMovementInterval = null;


    /**
     * Indique si le contrôleur est actif.
     */
    this.running = false;

  }


  // ============================================================
  // ÉTAT
  // ============================================================

  /**
   * Retourne l'état actuel.
   */
  getState() {

    return this.state;

  }


  /**
   * Modifie l'état actuel.
   */
  setState(newState) {

    const previousState =
      this.state;


    this.state =
      newState;


    this.notifyListeners(
      previousState,
      newState
    );

  }


  // ============================================================
  // SUBSCRIPTIONS
  // ============================================================

  /**
   * Abonne un composant.
   */
  subscribe(listener) {

    this.listeners.push(
      listener
    );


    return () => {

      this.unsubscribe(
        listener
      );

    };

  }


  /**
   * Désabonne un composant.
   */
  unsubscribe(listener) {

    this.listeners =
      this.listeners.filter(
        (item) =>
          item !== listener
      );

  }


  /**
   * Notifie les abonnés.
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


  // ============================================================
  // CONTRÔLE
  // ============================================================

  /**
   * Démarre les animations automatiques.
   */
  start() {

    if (
      this.running
    ) {

      return;

    }


    this.running =
      true;


    this.scheduleBlink();


    this.startHeadMovements();


    console.log(
      "[Lyssia Animation] Started"
    );

  }


  /**
   * Arrête les animations automatiques.
   */
  stop() {

    this.running =
      false;


    if (
      this.blinkTimeout
    ) {

      clearTimeout(
        this.blinkTimeout
      );

      this.blinkTimeout =
        null;

    }


    if (
      this.headMovementInterval
    ) {

      clearInterval(
        this.headMovementInterval
      );

      this.headMovementInterval =
        null;

    }


    this.setState(
      AnimationState.IDLE
    );


    console.log(
      "[Lyssia Animation] Stopped"
    );

  }


  // ============================================================
  // BLINK
  // ============================================================

  /**
   * Programme le prochain clignement.
   */
  scheduleBlink() {

    if (
      !this.running
    ) {

      return;

    }


    /**
     * Intervalle naturel aléatoire :
     *
     * entre 2 et 6 secondes.
     */
    const delay =
      2000 +
      Math.random() *
      4000;


    this.blinkTimeout =
      setTimeout(
        () => {

          this.blink();


          this.scheduleBlink();

        },
        delay
      );

  }


  /**
   * Déclenche un clignement.
   */
  blink() {

    this.setState(
      AnimationState.BLINK
    );


    /**
     * Durée approximative
     * d'un clignement naturel.
     */
    setTimeout(
  () => {

    if (this.running) {

      this.setState(
        AnimationState.IDLE
      );

    }

  },
  220
);
  }


  // ============================================================
  // HEAD MOVEMENTS
  // ============================================================

  /**
   * Démarre les micro-mouvements.
   */
  startHeadMovements() {

    this.headMovementInterval =
      setInterval(
        () => {

          if (
            !this.running
          ) {

            return;

          }


          this.moveHead();

        },
        5000
      );

  }


  /**
   * Déclenche un léger mouvement de tête.
   */
  moveHead() {

    this.setState(
      AnimationState.HEAD_MOVE
    );


    setTimeout(
      () => {

        if (
          this.running
        ) {

          this.setState(
            AnimationState.IDLE
          );

        }

      },
      700
    );

  }


  // ============================================================
  // COMPORTEMENTS
  // ============================================================

  /**
   * Animation pendant la parole.
   */
  startSpeaking() {

    this.setState(
      AnimationState.SPEAKING
    );

  }


  /**
   * Arrête l'animation de parole.
   */
  stopSpeaking() {

    if (
      this.running
    ) {

      this.setState(
        AnimationState.IDLE
      );

    }

  }


  /**
   * Animation pendant la réflexion.
   */
  startThinking() {

    this.setState(
      AnimationState.THINKING
    );

  }


  /**
   * Arrête la réflexion.
   */
  stopThinking() {

    if (
      this.running
    ) {

      this.setState(
        AnimationState.IDLE
      );

    }

  }


  // ============================================================
  // RESET
  // ============================================================

  /**
   * Réinitialise les animations.
   */
  reset() {

    this.stop();

  }


  /**
   * Nettoyage complet.
   */
  destroy() {

    this.stop();


    this.listeners = [];


    console.log(
      "[Lyssia Animation] Controller destroyed"
    );

  }

}