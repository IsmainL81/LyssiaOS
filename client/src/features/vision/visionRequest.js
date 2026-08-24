/**
 * =====================================================
 * LYSSIA OS
 * Module : Vision Request
 * =====================================================
 * Coeur partage d'une demande de vision -- construit le
 * prompt oral et appelle captureAndAnalyze. Utilise par
 * ChatPanel (texte) ET Conversation (voix), pour que le
 * comportement de "Lyssia qui regarde" soit identique
 * quelle que soit la modalite d'entree.
 *
 * La memorisation (addVisionMemory) se fait deja a
 * l'interieur de captureAndAnalyze -> analyzeImageData
 * (CameraView.jsx). Aucun appelant n'a besoin de
 * memoriser en plus.
 */

export async function performVisionRequest(
  visionController,
  userRequest
) {
  if (!visionController) {
    throw new Error(
      "Le moteur de vision de Lyssia n'est pas disponible."
    );
  }

  const visionRequest =
    userRequest?.trim() ||
    "Regarde attentivement cette scène.";

  const visionPrompt = `
${visionRequest}

Réponds comme Lyssia dans une conversation orale naturelle.

RÈGLES DE RÉPONSE :
- Réponds en français.
- Sois très concise.
- Pour une demande générale d'observation, réponds en UNE ou DEUX phrases maximum.
- Maximum 300 caractères environ.
- Donne seulement les éléments visuellement importants.
- Ne fais pas de liste.
- Ne donne pas de suggestions ou de conseils sauf si l'utilisateur les demande explicitement.
- Ne commence pas par « Merci — voici ce que j'observe ». 
- Ne répète pas la demande de l'utilisateur.
- Ne prétends jamais voir un élément qui n'est pas clairement visible.
`;

  const response =
    await visionController.captureAndAnalyze({
      prompt: visionPrompt,
      speak: false,
    });

  if (
    !response ||
    !response.trim()
  ) {
    throw new Error(
      "La vision n'a retourné aucune réponse."
    );
  }

  return response;
}
