import { AvatarEngine } from "./AvatarEngine.js";
import { LipSyncController } from "./LipSyncController.js";
import { AnimationController } from "./AnimationController.js";


/**
 * ============================================================
 * AVATAR SYSTEM
 * ============================================================
 *
 * Point central partagé pour l'état vivant de Lyssia.
 *
 * Une seule instance de chaque moteur est utilisée
 * dans l'ensemble de l'application.
 *
 * Conversation
 *      ↓
 * AvatarSystem
 *      ↓
 * ┌───────────────────────────────┐
 * │ AvatarEngine                  │
 * │ AnimationController           │
 * │ LipSyncController             │
 * └───────────────────────────────┘
 *      ↓
 * LyssiaAvatar
 *
 * ============================================================
 */


/* ============================================================
   INSTANCES UNIQUES
============================================================ */

export const avatarEngine =
  new AvatarEngine();


export const lipSyncController =
  new LipSyncController();


export const animationController =
  new AnimationController();


/* ============================================================
   DÉMARRAGE
============================================================ */

let avatarSystemStarted = false;


export function startAvatarSystem() {

  if (avatarSystemStarted) {
    return;
  }

  avatarSystemStarted = true;

  animationController.start();

  console.log(
    "[Lyssia AvatarSystem] Started"
  );

}


/* ============================================================
   IDLE
============================================================ */

export function avatarIdle() {

  /*
   * Arrêt des comportements temporaires.
   */

  lipSyncController.stop();

  animationController.stopSpeaking();
  animationController.stopThinking();

  /*
   * Retour de l'avatar au repos.
   */

  avatarEngine.idle();

}


/* ============================================================
   LISTENING
============================================================ */

export function avatarListening() {

  /*
   * Une écoute ne doit pas conserver
   * un état de parole précédent.
   */

  lipSyncController.stop();

  animationController.stopSpeaking();
  animationController.stopThinking();

  /*
   * Lyssia écoute.
   */

  avatarEngine.startListening();

}


/* ============================================================
   THINKING
============================================================ */

export function avatarThinking() {

  /*
   * La réflexion ne doit pas conserver
   * le lip-sync.
   */

  lipSyncController.stop();

  animationController.stopSpeaking();

  /*
   * Animation de réflexion.
   */

  animationController.startThinking();

  /*
   * État cognitif.
   */

  avatarEngine.startThinking();

}


/* ============================================================
   SPEAKING
============================================================ */

export function avatarSpeaking() {

  /*
   * On coupe d'abord une éventuelle
   * animation de réflexion.
   */

  animationController.stopThinking();

  /*
   * État comportemental.
   */

  avatarEngine.startSpeaking();

  /*
   * Animation corporelle.
   */

  animationController.startSpeaking();

  /*
   * Mouvement labial.
   */

  lipSyncController.start();

}


/* ============================================================
   STOP SPEAKING
============================================================ */

export function avatarStopSpeaking() {

  /*
   * Arrêt immédiat du mouvement des lèvres.
   */

  lipSyncController.stop();

  /*
   * Arrêt de l'animation de parole.
   */

  animationController.stopSpeaking();

  /*
   * Retour de l'avatar au repos.
   */

  avatarEngine.stopSpeaking();

}


/* ============================================================
   RESET
============================================================ */

export function resetAvatarSystem() {

  lipSyncController.reset();

  animationController.reset();

  avatarEngine.reset();

}


/* ============================================================
   ÉTAT COURANT
============================================================ */

export function getAvatarState() {

  return avatarEngine.getState();

}


export function getLipSyncState() {

  return lipSyncController.getState();

}


export function getAnimationState() {

  return animationController.getState();

}


/* ============================================================
   DESTRUCTION
============================================================ */

export function destroyAvatarSystem() {

  lipSyncController.destroy();

  animationController.destroy();

  avatarEngine.destroy();

  avatarSystemStarted = false;

  console.log(
    "[Lyssia AvatarSystem] Destroyed"
  );

}