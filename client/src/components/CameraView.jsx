/**
 * =====================================================
 * LYSSIA OS
 * Module : CameraView
 * Version : 3.0
 * =====================================================
 */
import {
  CONVERSATION_STATES,
} from "../core/ConversationState";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Box,
  Button,
  Typography,
} from "@mui/material";

import { analyzeImage } from "../features/vision/VisionEngine";

import {
  isVoiceSupported,
  speak,
  stopSpeaking,
} from "../features/voice/VoiceEngine";

import { useLyssia } from "../core/LyssiaCore";
import { useVision } from "../features/vision/VisionContext";

const CHANGE_THRESHOLD = 0.08;
const OBSERVATION_INTERVAL = 5000;

export default function CameraView() {
  const {
  setSystemState,
  conversationState,
  updateConversationState:
    updateConversationStateCore,
  addVisionMemory,
  addVisionEvent,
} = useLyssia();

  const {
    setVisionController,
  } = useVision();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const comparisonCanvasRef = useRef(null);

  const streamRef = useRef(null);
  const cameraStartingRef = useRef(false);

  const continuousVisionRef =
    useRef(false);

  const visionIntervalRef =
    useRef(null);

  const visionBusyRef =
    useRef(false);

  const previousObservationRef =
    useRef(null);

  const lastVisionImageRef =
    useRef(null);

  const [cameraActive, setCameraActive] =
    useState(false);

  const [capturedImage, setCapturedImage] =
    useState(null);

  const [analysis, setAnalysis] =
    useState("");

  const [analyzing, setAnalyzing] =
    useState(false);

  const [speaking, setSpeaking] =
    useState(false);

  const [error, setError] =
    useState("");

  const [statusMessage, setStatusMessage] =
    useState("Caméra inactive.");

  const [continuousVision, setContinuousVision] =
    useState(false);

  /*
   * =====================================================
   * CAMÉRA
   * =====================================================
   */

  async function startCamera() {
    setError("");

    if (cameraStartingRef.current) {
      return false;
    }

    if (
      streamRef.current &&
      streamRef.current.active
    ) {
      return true;
    }

    cameraStartingRef.current = true;

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "La caméra n'est pas disponible dans ce navigateur."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current =
        stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;

        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn(
            "Lecture vidéo différée :",
            playError
          );
        }
      }

      setCameraActive(true);

      setSystemState((previous) => ({
        ...previous,
        vision: "online",
      }));

      setStatusMessage(
        "Caméra active."
      );

      return true;
    } catch (cameraError) {
      console.error(
        "Erreur caméra :",
        cameraError
      );

      const message =
        cameraError?.name ===
        "NotAllowedError"
          ? "L'accès à la caméra a été refusé."
          : cameraError?.name ===
              "NotFoundError"
            ? "Aucune caméra n'a été trouvée."
            : cameraError?.message ||
              "Impossible d'activer la caméra.";

      setError(message);
      setCameraActive(false);

      setSystemState((previous) => ({
        ...previous,
        vision: "error",
      }));

      setStatusMessage(message);

      return false;
    } finally {
      cameraStartingRef.current = false;
    }
  }

  /*
   * =====================================================
   * ARRÊT CAMÉRA
   * =====================================================
   */

  function stopCamera() {
    stopContinuousVision();

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    streamRef.current =
      null;

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setCameraActive(false);

    setSystemState((previous) => ({
      ...previous,
      vision: "waiting",
    }));

    setStatusMessage(
      "Caméra arrêtée."
    );
  }

  /*
   * =====================================================
   * CAPTURE POUR COMPARAISON
   * =====================================================
   */

  function captureObservationImage() {
    const video =
      videoRef.current;

    const canvas =
      comparisonCanvasRef.current;

    if (!video || !canvas) {
      return null;
    }

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return null;
    }

    const width = 160;
    const height = 120;

    canvas.width =
      width;

    canvas.height =
      height;

    const context =
      canvas.getContext(
        "2d",
        {
          willReadFrequently: true,
        }
      );

    if (!context) {
      return null;
    }

    context.save();

    context.translate(
      width,
      0
    );

    context.scale(
      -1,
      1
    );

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    context.restore();

    const pixels =
      context.getImageData(
        0,
        0,
        width,
        height
      ).data;

    return {
      width,
      height,
      pixels:
        new Uint8ClampedArray(
          pixels
        ),
    };
  }

  /*
   * =====================================================
   * DIFFÉRENCE ENTRE DEUX SCÈNES
   * =====================================================
   */

  function calculateSceneDifference(
    previous,
    current
  ) {
    if (
      !previous ||
      !current
    ) {
      return 1;
    }

    if (
      previous.width !==
        current.width ||
      previous.height !==
        current.height
    ) {
      return 1;
    }

    const previousPixels =
      previous.pixels;

    const currentPixels =
      current.pixels;

    let totalDifference =
      0;

    let samples =
      0;

    const step = 8;

    for (
      let index = 0;
      index <
      currentPixels.length;
      index +=
        4 * step
    ) {
      const r1 =
        previousPixels[index];

      const g1 =
        previousPixels[
          index + 1
        ];

      const b1 =
        previousPixels[
          index + 2
        ];

      const r2 =
        currentPixels[index];

      const g2 =
        currentPixels[
          index + 1
        ];

      const b2 =
        currentPixels[
          index + 2
        ];

      const difference =
        (
          Math.abs(
            r1 - r2
          ) +
          Math.abs(
            g1 - g2
          ) +
          Math.abs(
            b1 - b2
          )
        ) /
        (255 * 3);

      totalDifference +=
        difference;

      samples += 1;
    }

    if (!samples) {
      return 0;
    }

    return (
      totalDifference /
      samples
    );
  }

  /*
   * =====================================================
   * CAPTURE IMAGE
   * =====================================================
   */

  function captureImage() {
    setError("");

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    if (!video) {
      const message =
        "La caméra vidéo n'est pas disponible.";

      setError(message);

      return null;
    }

    if (!canvas) {
      const message =
        "Impossible de préparer la capture.";

      setError(message);

      return null;
    }

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      const message =
        "La caméra n'est pas encore prête. Réessaie dans un instant.";

      setError(message);

      return null;
    }

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext(
        "2d"
      );

    if (!context) {
      const message =
        "Impossible de préparer la capture.";

      setError(message);

      return null;
    }

    context.save();

    context.translate(
      canvas.width,
      0
    );

    context.scale(
      -1,
      1
    );

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.restore();

    const imageData =
      canvas.toDataURL(
        "image/jpeg",
        0.9
      );

    setCapturedImage(
      imageData
    );

    setError("");

    return imageData;
  }

  /*
   * =====================================================
   * ANALYSE VISION
   * =====================================================
   */

  async function analyzeImageData(
  imageData,
  options = {}
) {
  if (!imageData) {
    throw new Error(
      "Aucune image à analyser."
    );
  }

  if (
    visionBusyRef.current
  ) {
    throw new Error(
      "Une analyse est déjà en cours."
    );
  }

  /*
   * La vision analyse l'image.
   *
   * IMPORTANT :
   * elle ne contrôle pas la parole globale
   * de Lyssia.
   *
   * La voix conversationnelle est gérée
   * par ChatPanel → VoiceEngine.
   */

  visionBusyRef.current =
    true;

  setAnalyzing(true);
  setError("");

  setSystemState((previous) => ({
    ...previous,
    vision: "thinking",
    ai: "thinking",
  }));

  setStatusMessage(
    options.continuous
      ? "Lyssia détecte un changement..."
      : "Lyssia observe l'image..."
  );

  try {
    const response =
      await analyzeImage(
        imageData,
        options.prompt ||
          "Décris ce que tu vois dans cette image. Identifie les éléments importants, les personnes, les objets et les changements visibles. Ne prétends pas connaître ce qui n'est pas visible. Réponds en français, naturellement et de manière concise."
      );

    if (
      !response ||
      !response.trim()
    ) {
      throw new Error(
        "La vision n'a retourné aucune réponse."
      );
    }

    const cleanResponse =
      response.trim();

    setAnalysis(
      cleanResponse
    );

    setCapturedImage(
      imageData
    );

    /*
     * Une véritable analyse Vision
     * devient une perception mémorisée.
     */

    try {
      addVisionMemory(
        cleanResponse,
        {
          continuous:
            options.continuous === true,

          timestamp:
            new Date().toISOString(),
        }
      );
    } catch (memoryError) {
      console.warn(
        "Impossible d'enregistrer la perception dans la mémoire :",
        memoryError
      );
    }

    setAnalyzing(false);

    setSystemState((previous) => ({
      ...previous,

      vision:
        options.continuous
          ? "observing"
          : "online",

      ai: "online",
    }));

    setStatusMessage(
      options.continuous
        ? "Nouvelle perception mémorisée."
        : "J'ai terminé mon observation."
    );

    /*
     * =================================================
     * PAROLE VISION
     * =================================================
     *
     * La vision peut retourner son texte,
     * mais ne lance plus automatiquement
     * le moteur vocal global.
     *
     * La parole de Lyssia est centralisée
     * dans ChatPanel.
     */

    return cleanResponse;

  } catch (analysisError) {
    console.error(
      "Erreur VisionEngine :",
      analysisError
    );

    setAnalyzing(false);

    setError(
      analysisError?.message ||
        "Impossible d'analyser l'image."
    );

    setSystemState((previous) => ({
      ...previous,

      vision:
        options.continuous
          ? "observing"
          : "online",

      ai: "online",
    }));

    throw analysisError;

  } finally {
    visionBusyRef.current =
      false;
  }

    if (
      visionBusyRef.current
    ) {
      throw new Error(
        "Une analyse est déjà en cours."
      );
    }

    visionBusyRef.current =
  true;

/*
 * La vision ne doit pas interrompre
 * automatiquement une conversation vocale.
 *
 * Une interruption volontaire passe
 * par stopLyssiaSpeaking().
 */
console.log(
  "👁️ Lyssia — état avant analyse vision :",
  conversationState
);

visionBusyRef.current =
  true;

setAnalyzing(true);
setError("");

setAnalyzing(true);
    setError("");

    setSystemState((previous) => ({
      ...previous,
      vision: "thinking",
      ai: "thinking",
    }));

    setStatusMessage(
      options.continuous
        ? "Lyssia détecte un changement..."
        : "Lyssia observe l'image..."
    );

    try {
      const response =
        await analyzeImage(
          imageData,
          options.prompt ||
            "Décris ce que tu vois dans cette image. Identifie les éléments importants, les personnes, les objets et les changements visibles. Réponds en français, naturellement et de manière concise."
        );

      if (
        !response ||
        !response.trim()
      ) {
        throw new Error(
          "La vision n'a retourné aucune réponse."
        );
      }

      const cleanResponse =
        response.trim();

      setAnalysis(
        cleanResponse
      );

      setCapturedImage(
        imageData
      );

      /*
       * Une véritable analyse Vision
       * devient une perception mémorisée.
       */

      try {
        addVisionMemory(
          cleanResponse,
          {
            continuous:
              options.continuous ===
              true,

            timestamp:
              new Date().toISOString(),
          }
        );
      } catch (memoryError) {
        console.warn(
          "Impossible d'enregistrer la perception dans la mémoire :",
          memoryError
        );
      }

      setAnalyzing(false);

      setSystemState((previous) => ({
        ...previous,
        vision:
          options.continuous
            ? "observing"
            : "online",
        ai: "online",
      }));

      setStatusMessage(
        options.continuous
          ? "Nouvelle perception mémorisée."
          : "J'ai terminé mon observation."
      );

      /*
       * =================================================
       * PAROLE
       * =================================================
       */

      if (
        options.speak === true &&
        isVoiceSupported() &&
        cleanResponse
      ) {
        setSpeaking(true);

        setSystemState((previous) => ({
          ...previous,
          vision:
            options.continuous
              ? "observing"
              : "online",
          ai: "speaking",
        }));

        try {
          await speak(
            cleanResponse,
            {
              language:
                "fr-FR",

              rate: 1,

              pitch: 1,

              volume: 1,

              onStart: () => {
                setSpeaking(true);

                setSystemState(
                  (previous) => ({
                    ...previous,
                    vision:
                      options.continuous
                        ? "observing"
                        : "online",
                    ai: "speaking",
                  })
                );
              },

              onEnd: () => {
                setSpeaking(false);

                setSystemState(
                  (previous) => ({
                    ...previous,
                    vision:
                      options.continuous
                        ? "observing"
                        : "online",
                    ai: "online",
                  })
                );
              },

              onError: (
                voiceError
              ) => {
                console.warn(
                  "Erreur synthèse Vision :",
                  voiceError
                );

                setSpeaking(false);

                setSystemState(
                  (previous) => ({
                    ...previous,
                    vision:
                      options.continuous
                        ? "observing"
                        : "online",
                    ai: "online",
                  })
                );
              },
            }
          );
        } catch (voiceError) {
          console.warn(
            "Impossible de faire parler Lyssia :",
            voiceError
          );

          setSpeaking(false);
        }
      }

      return cleanResponse;
    } catch (analysisError) {
      console.error(
        "Erreur VisionEngine :",
        analysisError
      );

      const message =
        analysisError?.message ||
        "Lyssia n'a pas pu analyser la scène.";

      setError(message);
      setAnalyzing(false);

      setSystemState((previous) => ({
        ...previous,
        vision:
          options.continuous
            ? "observing"
            : "error",
        ai: "online",
      }));

      setStatusMessage(
        message
      );

      throw analysisError;
    } finally {
      visionBusyRef.current =
        false;
    }
  }

  /*
   * =====================================================
   * CAPTURE + ANALYSE
   * =====================================================
   */

  async function captureAndAnalyze(
    options = {}
  ) {
    setError("");

    let active =
      Boolean(
        streamRef.current &&
        streamRef.current.active
      );

    if (!active) {
      active =
        await startCamera();
    }

    if (!active) {
      throw new Error(
        "Impossible d'activer la caméra."
      );
    }

    if (
      videoRef.current &&
      (
        !videoRef.current.videoWidth ||
        !videoRef.current.videoHeight
      )
    ) {
      await new Promise(
        (resolve) => {
          let finished =
            false;

          const finish = () => {
            if (finished) {
              return;
            }

            finished = true;

            resolve();
          };

          const timeout =
            setTimeout(
              finish,
              1500
            );

          videoRef.current.onloadeddata =
            () => {
              clearTimeout(
                timeout
              );

              finish();
            };
        }
      );
    }

    const imageData =
      captureImage();
  if (!imageData) {
      throw new Error(
        "Impossible de capturer la scène."
      );
    }

    return await analyzeImageData(
      imageData,
      options
    );
  }

  /*
   * =====================================================
   * OBSERVATION CONTINUE
   * =====================================================
   */

  async function observeContinuously() {
    /*
     * IMPORTANT :
     * on vérifie le flux réel plutôt que cameraActive.
     *
     * Cela permet à la vision autonome de fonctionner
     * immédiatement après l'activation de la caméra.
     */

    if (
      !continuousVisionRef.current ||
      !streamRef.current ||
      !streamRef.current.active ||
      visionBusyRef.current
    ) {
      return;
    }

    const observation =
      captureObservationImage();

    if (!observation) {
      return;
    }

    const previous =
      previousObservationRef.current;

    /*
     * Première observation :
     * elle devient la référence.
     */

    if (!previous) {
      previousObservationRef.current =
        observation;

      setStatusMessage(
        "Lyssia observe la scène..."
      );

      return;
    }

    const difference =
      calculateSceneDifference(
        previous,
        observation
      );

    previousObservationRef.current =
      observation;

    if (
      difference <
      CHANGE_THRESHOLD
    ) {
      setStatusMessage(
        "Lyssia observe. Aucun changement important."
      );

      return;
    }

    addVisionEvent({
      type: "change",
      message:
        "Changement significatif détecté dans la scène.",
      difference,
    });

    /*
     * Changement significatif.
     */

    const imageData =
      captureImage();
  if (!imageData) {
      return;
    }

    lastVisionImageRef.current =
      imageData;

    try {
      await analyzeImageData(
        imageData,
        {
          continuous: true,

          speak: false,

          prompt:
            "Tu observes cette scène en vision continue. Décris uniquement ce qui est important ou ce qui semble avoir changé depuis l'observation précédente. Ne prétends pas connaître ce qui n'est pas visible. Réponds naturellement en français, en une ou deux phrases.",
        }
      );
    } catch (continuousError) {
      console.warn(
        "Erreur observation continue :",
        continuousError
      );
    }
  }

  /*
   * =====================================================
   * DÉMARRER VISION CONTINUE
   * =====================================================
   */

  function startContinuousVision() {
    if (
      continuousVisionRef.current
    ) {
      return;
    }

    /*
     * Vérification du flux réel.
     */

    if (
      !streamRef.current ||
      !streamRef.current.active
    ) {
      setError(
        "La caméra n'est pas active."
      );

      return;
    }

    continuousVisionRef.current =
      true;

    setContinuousVision(
      true
    );

    previousObservationRef.current =
      null;

    lastVisionImageRef.current =
      null;

    setError("");

    setStatusMessage(
      "Vision continue active. Lyssia observe..."
    );

    setSystemState((previous) => ({
      ...previous,
      vision: "observing",
    }));

    /*
     * Observation immédiate.
     */

    observeContinuously();

    /*
     * Évite plusieurs intervalles.
     */

    if (
      visionIntervalRef.current
    ) {
      window.clearInterval(
        visionIntervalRef.current
      );
    }

    visionIntervalRef.current =
      window.setInterval(
        () => {
          observeContinuously();
        },
        OBSERVATION_INTERVAL
      );
  }

  /*
   * =====================================================
   * ARRÊTER VISION CONTINUE
   * =====================================================
   */

  function stopContinuousVision() {
    continuousVisionRef.current =
      false;

    setContinuousVision(
      false
    );

    previousObservationRef.current =
      null;

    lastVisionImageRef.current =
      null;

    if (
      visionIntervalRef.current
    ) {
      window.clearInterval(
        visionIntervalRef.current
      );

      visionIntervalRef.current =
        null;
    }

    const cameraIsActive =
      Boolean(
        streamRef.current &&
        streamRef.current.active
      );

    setStatusMessage(
      cameraIsActive
        ? "Vision continue arrêtée."
        : "Caméra inactive."
    );

    setSystemState((previous) => ({
      ...previous,
      vision:
        cameraIsActive
          ? "online"
          : "waiting",
    }));
  }

  /*
   * =====================================================
   * INTERRUPTION PAROLE
   * =====================================================
   */

  function stopLyssiaSpeaking() {
    stopSpeaking();

    setSpeaking(false);

    updateConversationStateCore(
  CONVERSATION_STATES.INTERRUPTED
);

    setSystemState((previous) => ({
      ...previous,

      vision:
        analyzing
          ? "thinking"
          : continuousVision
            ? "observing"
            : "online",

      ai:
        analyzing
          ? "thinking"
          : "online",
    }));

    setStatusMessage(
      continuousVision
        ? "Lyssia continue d'observer."
        : "Lyssia a arrêté de parler."
    );

    updateConversationStateCore(
        CONVERSATION_STATES.IDLE
    );
  }

  /*
   * =====================================================
   * RETAKE
   * =====================================================
   */

  function retakeImage() {
    setCapturedImage(null);
    setAnalysis("");
    setError("");

    setSystemState((previous) => ({
      ...previous,

      vision:
        cameraActive
          ? continuousVision
            ? "observing"
            : "online"
          : "waiting",
    }));

    setStatusMessage(
      cameraActive
        ? continuousVision
          ? "Vision continue active."
          : "Prête pour une nouvelle capture."
        : "Caméra inactive."
    );
  }

  /*
   * =====================================================
   * VISION AUTONOME
   * =====================================================
   *
   * CameraView est monté dans le Dashboard.
   *
   * La caméra démarre automatiquement.
   * Puis la vision continue démarre automatiquement.
   *
   * L'autorisation navigateur reste obligatoire.
   */

  useEffect(() => {
    let cancelled =
      false;

    async function startAutonomousVision() {
      try {
        const active =
          await startCamera();

        if (
          !active ||
          cancelled
        ) {
          return;
        }

        if (
          !streamRef.current ||
          !streamRef.current.active
        ) {
          return;
        }

        if (
          !continuousVisionRef.current
        ) {
          startContinuousVision();
}

        setStatusMessage(
          "Caméra active. Vision en veille."
    );

        setSystemState(
          (previous) => ({
        ...previous,

          vision: "online",
      })
    );


      } catch (error) {
        console.warn(
          "Impossible de démarrer automatiquement la vision de Lyssia :",
          error
        );
      }
    }

    startAutonomousVision();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =====================================================
   * CONTRÔLEUR VISION
   * =====================================================
   */

  useEffect(() => {
    const controller = {
      startCamera,

      stopCamera,

      captureImage,

      analyzeImageData,

      captureAndAnalyze,

      startContinuousVision,

      stopContinuousVision,

      retakeImage,

      stopLyssiaSpeaking,

      isActive: () =>
        Boolean(
          streamRef.current &&
          streamRef.current.active
        ),

      hasCapturedImage: () =>
        Boolean(
          capturedImage
        ),

      getCapturedImage: () =>
        capturedImage || null,

      isContinuousVisionActive:
        () =>
          continuousVisionRef.current,
    };

    setVisionController(
      controller
    );

    return () => {
      setVisionController(
        null
      );
    };
  }, [
    setVisionController,
    capturedImage,
    cameraActive,
    analyzing,
    continuousVision,
  ]);

  /*
   * =====================================================
   * NETTOYAGE
   * =====================================================
   */

  useEffect(() => {
    return () => {
      continuousVisionRef.current =
        false;

      if (
        visionIntervalRef.current
      ) {
        window.clearInterval(
          visionIntervalRef.current
        );

        visionIntervalRef.current =
          null;
      }

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) => {
              track.stop();
            }
          );
      }

      streamRef.current =
        null;
    };
  }, []);

  /*
   * =====================================================
   * INTERFACE
   * =====================================================
   */

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 500,

        display: "flex",
        flexDirection: "column",

        gap: 2,

        p: 2,

        background:
          "#0b1220",

        color: "white",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
        }}
      >
        Vision de Lyssia
      </Typography>

      <Box
        sx={{
          position: "relative",

          flex: 1,

          minHeight: 300,

          overflow: "hidden",

          borderRadius: 3,

          background:
            "#050912",

          border:
            "1px solid rgba(89,217,255,0.12)",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",

            objectFit: "cover",

            display:
              cameraActive
                ? "block"
                : "none",

            transform:
              "scaleX(-1)",
          }}
        />

        {!cameraActive && (
          <Box
            sx={{
              position:
                "absolute",

              inset: 0,

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              color:
                "#64748b",
            }}
          >
            Caméra inactive
          </Box>
        )}

        {continuousVision &&
          !analyzing && (
            <Box
              sx={{
                position:
                  "absolute",

                top: 12,

                left: 12,

                px: 1.5,

                py: 0.75,

                borderRadius: 2,

                background:
                  "rgba(5,9,18,0.75)",

                border:
                  "1px solid rgba(89,217,255,0.3)",
              }}
            >
              <Typography
                sx={{
                  color:
                    "#59d9ff",

                  fontSize:
                    13,

                  fontWeight:
                    600,
                }}
              >
                ● Vision continue
              </Typography>
            </Box>
          )}

        {analyzing && (
          <Box
            sx={{
              position:
                "absolute",

              inset: 0,

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              background:
                "rgba(5,9,18,0.55)",

              backdropFilter:
                "blur(3px)",
            }}
          >
            <Typography
              sx={{
                color:
                  "#b77cff",

                fontSize:
                  18,

                fontWeight:
                  600,
              }}
            >
              Lyssia observe le changement...
            </Typography>
          </Box>
        )}
      </Box>

      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />

      <canvas
        ref={comparisonCanvasRef}
        style={{
          display: "none",
        }}
      />

      {error && (
        <Typography
          sx={{
            color:
              "#ff647c",

            fontSize:
              14,
          }}
        >
          {error}
        </Typography>
      )}

      {analysis && (
        <Box
          sx={{
            p: 2,

            borderRadius: 3,

            background:
              "#101827",

            border:
              "1px solid rgba(89,217,255,0.08)",

            maxHeight: 220,

            overflowY:
              "auto",
          }}
        >
          <Typography
            sx={{
              color:
                "#59d9ff",

              fontWeight:
                700,

              mb: 1,
            }}
          >
            Perception de Lyssia
          </Typography>

          <Typography
            sx={{
              color:
                "#e2e8f0",

              lineHeight:
                1.6,
            }}
          >
            {analysis}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",

          gap: 1,

          flexWrap:
            "wrap",
        }}
      >
        {!cameraActive ? (
          <Button
            variant="contained"
            onClick={
              startCamera
            }
          >
            Activer la caméra
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={
              stopCamera
            }
          >
            Arrêter
          </Button>
        )}

        {cameraActive && (
          <Button
            variant="contained"
            onClick={() =>
              captureAndAnalyze({
                speak: true,
              })
            }
            disabled={
              analyzing
            }
          >
            {analyzing
              ? "Analyse..."
              : "Regarder la scène"}
          </Button>
        )}

        {cameraActive &&
          !continuousVision && (
            <Button
              variant="outlined"
              onClick={
                startContinuousVision
              }
            >
              Activer la vision continue
            </Button>
          )}

        {cameraActive &&
          continuousVision && (
            <Button
              variant="outlined"
              color="warning"
              onClick={
                stopContinuousVision
              }
            >
              Arrêter la vision continue
            </Button>
          )}

        {capturedImage && (
          <Button
            variant="outlined"
            onClick={
              retakeImage
            }
          >
            Nouvelle capture
          </Button>
        )}

        {speaking && (
          <Button
            variant="outlined"
            color="error"
            onClick={
              stopLyssiaSpeaking
            }
          >
            Arrêter Lyssia
          </Button>
        )}
      </Box>

      <Typography
        sx={{
          color:
            continuousVision
              ? "#59d9ff"
              : "#64748b",

          fontSize:
            13,
        }}
      >
        {statusMessage}
      </Typography>
    </Box>
  );
}










