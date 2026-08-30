import React, {
  useEffect,
  useState,
} from "react";

import {
  AvatarState,
} from "./AvatarState.js";

import {
  LipSyncState,
} from "./LipSyncController.js";

import {
  AnimationState,
} from "./AnimationController.js";

import "./LyssiaAvatar.css";


/**
 * ============================================================
 * LYSSIA AVATAR
 * ============================================================
 *
 * Composant visuel principal de Lyssia.
 *
 * Responsabilités :
 *
 * - afficher le portrait ;
 * - écouter AvatarEngine ;
 * - écouter LipSyncController ;
 * - écouter AnimationController ;
 * - appliquer les états visuels ;
 * - afficher les couches animées du visage.
 *
 * ============================================================
 */

export function LyssiaAvatar({
  avatarEngine,
  lipSyncController,
  animationController,
  imageSrc,
}) {

  // ============================================================
  // ÉTAT AVATAR
  // ============================================================

  const [
    avatarState,
    setAvatarState,
  ] = useState(
    avatarEngine.getState()
  );


  // ============================================================
  // ÉTAT LIP SYNC
  // ============================================================

  const [
    lipSyncState,
    setLipSyncState,
  ] = useState(
    lipSyncController.getState()
  );


  // ============================================================
  // ÉTAT ANIMATION
  // ============================================================

  const [
    animationState,
    setAnimationState,
  ] = useState(
    animationController.getState()
  );


  // ============================================================
  // AVATAR ENGINE
  // ============================================================

  useEffect(() => {

    const unsubscribe =
      avatarEngine.subscribe(
        (
          previousState,
          newState
        ) => {

          console.log(
            "[LyssiaAvatar]",
            previousState,
            "→",
            newState
          );

          setAvatarState(
            newState
          );

        }
      );


    return () => {

      unsubscribe();

    };

  }, [
    avatarEngine,
  ]);


  // ============================================================
  // LIP SYNC CONTROLLER
  // ============================================================

  useEffect(() => {

    const unsubscribe =
      lipSyncController.subscribe(
        (
          previousState,
          newState
        ) => {

          console.log(
            "[LyssiaAvatar LipSync]",
            previousState,
            "→",
            newState
          );

          setLipSyncState(
            newState
          );

        }
      );


    return () => {

      unsubscribe();

    };

  }, [
    lipSyncController,
  ]);


  // ============================================================
  // ANIMATION CONTROLLER
  // ============================================================

  useEffect(() => {

    const unsubscribe =
      animationController.subscribe(
        (
          previousState,
          newState
        ) => {

          console.log(
            "[LyssiaAvatar Animation]",
            previousState,
            "→",
            newState
          );

          setAnimationState(
            newState
          );

        }
      );


    return () => {

      unsubscribe();

    };

  }, [
    animationController,
  ]);


  // ============================================================
  // ÉTATS VISUELS
  // ============================================================

  const isBlinking =
    animationState ===
    AnimationState.BLINK;


  const isSpeaking =
    lipSyncState ===
      LipSyncState.SPEAKING ||
    avatarState ===
      AvatarState.SPEAKING;


  const isThinking =
    avatarState ===
    AvatarState.THINKING;


  const isListening =
    avatarState ===
    AvatarState.LISTENING;


  const isHeadMoving =
    animationState ===
    AnimationState.HEAD_MOVE;


  // ============================================================
  // CLASSE PRINCIPALE
  // ============================================================

  const avatarClassName = [

    "lyssia-avatar",

    `lyssia-state-${avatarState.toLowerCase()}`,

    `lyssia-animation-${animationState.toLowerCase()}`,

    isBlinking
      ? "lyssia-blinking"
      : "",

    isSpeaking
      ? "lyssia-speaking"
      : "",

    isThinking
      ? "lyssia-thinking"
      : "",

    isListening
      ? "lyssia-listening"
      : "",

    isHeadMoving
      ? "lyssia-head-moving"
      : "",

  ]
    .filter(Boolean)
    .join(" ");


  // ============================================================
  // TEXTE DU STATUT
  // ============================================================

  let statusLabel =
    "En attente";


  if (
    avatarState ===
    AvatarState.LISTENING
  ) {

    statusLabel =
      "Écoute...";

  } else if (
    avatarState ===
    AvatarState.THINKING
  ) {

    statusLabel =
      "Réflexion...";

  } else if (
    avatarState ===
    AvatarState.SPEAKING
  ) {

    statusLabel =
      "Lyssia parle...";

  }


  // ============================================================
  // RENDU
  // ============================================================

  return (

    <div
      className={
        avatarClassName
      }
    >

      {/* ======================================================
          IMAGE PRINCIPALE
      ======================================================= */}

      <img
        src={imageSrc}
        alt="Lyssia"
        className="lyssia-avatar-image"
        draggable="false"
      />


      {/* ======================================================
          COUCHE YEUX
      ======================================================= */}

      <div
        className="lyssia-eyes"
        aria-hidden="true"
      >

        <div
          className="
            lyssia-eye
            lyssia-eye-left
          "
        />


        <div
          className="
            lyssia-eye
            lyssia-eye-right
          "
        />

      </div>


      {/* ======================================================
          COUCHE BOUCHE
      ======================================================= */}

      <div
        className="lyssia-mouth-layer"
        aria-hidden="true"
      >

        <div
          className="lyssia-mouth"
        />

      </div>


      {/* ======================================================
          HALO CYBERNÉTIQUE
      ======================================================= */}

      <div
        className="
          lyssia-cyber-glow
        "
        aria-hidden="true"
      />


      {/* ======================================================
          STATUT
      ======================================================= */}

      <div
        className="lyssia-status"
      >

        <span
          className="
            lyssia-status-dot
          "
        />

        <span>
          {statusLabel}
        </span>

      </div>

    </div>

  );

}