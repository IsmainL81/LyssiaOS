import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

const VisionContext =
  createContext(null);

export function VisionProvider({
  children,
}) {
  /*
   * =====================================================
   * CONTRÔLEUR VISION
   * =====================================================
   */

  const controllerRef =
    useRef(null);

  /*
   * =====================================================
   * ENREGISTREMENT DU CONTRÔLEUR
   * =====================================================
   */

  const setVisionController =
    useCallback((controller) => {
      controllerRef.current =
        controller || null;
    }, []);

  /*
   * =====================================================
   * ACCÈS AU CONTRÔLEUR
   * =====================================================
   *
   * On utilise un objet stable.
   *
   * Le ChatPanel récupère toujours le contrôleur
   * actuellement enregistré par CameraView.
   */

  const visionController =
    useMemo(() => {
      return {
        startCamera: async () => {
          if (
            !controllerRef.current
          ) {
            throw new Error(
              "Le moteur de vision n'est pas disponible."
            );
          }

          return await controllerRef
            .current
            .startCamera();
        },

        stopCamera: () => {
          if (
            !controllerRef.current
          ) {
            return;
          }

          return controllerRef
            .current
            .stopCamera();
        },

        captureImage: () => {
          if (
            !controllerRef.current
          ) {
            throw new Error(
              "Le moteur de vision n'est pas disponible."
            );
          }

          return controllerRef
            .current
            .captureImage();
        },

        /*
         * =================================================
         * CAPTURE + ANALYSE
         * =================================================
         *
         * C'est la méthode utilisée par ChatPanel.
         */

        captureAndAnalyze:
          async (options = {}) => {
            if (
              !controllerRef.current
            ) {
              throw new Error(
                "Le moteur de vision n'est pas disponible."
              );
            }

            if (
              typeof controllerRef
                .current
                .captureAndAnalyze !==
              "function"
            ) {
              throw new Error(
                "La fonction captureAndAnalyze n'est pas disponible."
              );
            }

            return await controllerRef
              .current
              .captureAndAnalyze(
                options
              );
          },

        analyzeImageData:
          async (
            imageData,
            options = {}
          ) => {
            if (
              !controllerRef.current
            ) {
              throw new Error(
                "Le moteur de vision n'est pas disponible."
              );
            }

            if (
              typeof controllerRef
                .current
                .analyzeImageData !==
              "function"
            ) {
              throw new Error(
                "La fonction analyzeImageData n'est pas disponible."
              );
            }

            return await controllerRef
              .current
              .analyzeImageData(
                imageData,
                options
              );
          },

        retakeImage: () => {
          if (
            !controllerRef.current
          ) {
            return;
          }

          return controllerRef
            .current
            .retakeImage();
        },

        stopLyssiaSpeaking: () => {
          if (
            !controllerRef.current
          ) {
            return;
          }

          return controllerRef
            .current
            .stopLyssiaSpeaking();
        },

        isActive: () => {
          if (
            !controllerRef.current
          ) {
            return false;
          }

          if (
            typeof controllerRef
              .current
              .isActive !==
            "function"
          ) {
            return false;
          }

          return controllerRef
            .current
            .isActive();
        },

        hasCapturedImage: () => {
          if (
            !controllerRef.current
          ) {
            return false;
          }

          if (
            typeof controllerRef
              .current
              .hasCapturedImage !==
            "function"
          ) {
            return false;
          }

          return controllerRef
            .current
            .hasCapturedImage();
        },

        getCapturedImage: () => {
          if (
            !controllerRef.current
          ) {
            return null;
          }

          if (
            typeof controllerRef
              .current
              .getCapturedImage !==
            "function"
          ) {
            return null;
          }

          return controllerRef
            .current
            .getCapturedImage();
        },
      };
    }, []);

  /*
   * =====================================================
   * CONTEXTE
   * =====================================================
   */

  const value = useMemo(
    () => ({
      setVisionController,
      visionController,
    }),
    [
      setVisionController,
      visionController,
    ]
  );

  return (
    <VisionContext.Provider
      value={value}
    >
      {children}
    </VisionContext.Provider>
  );
}


/*
 * =====================================================
 * HOOK
 * =====================================================
 */

export function useVision() {
  const context =
    useContext(
      VisionContext
    );

  if (!context) {
    throw new Error(
      "useVision doit être utilisé dans VisionProvider."
    );
  }

  return context;
}