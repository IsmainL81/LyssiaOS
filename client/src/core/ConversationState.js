/**
 * =====================================================
 * LYSSIA OS
 * Conversation State
 * Version : 1.0
 * =====================================================
 *
 * État central de la conversation de Lyssia.
 *
 * Le moteur cognitif décide CE QUE Lyssia comprend.
 * Ce module décide DANS QUEL ÉTAT conversationnel
 * Lyssia se trouve.
 * =====================================================
 */

export const CONVERSATION_STATES = {
  IDLE: "idle",
  THINKING: "thinking",
  SPEAKING: "speaking",
  LISTENING: "listening",
  VISION: "vision",
  INTERRUPTED: "interrupted",
};

let currentState =
  CONVERSATION_STATES.IDLE;

const listeners = new Set();

export function getConversationState() {
  return currentState;
}

export function setConversationState(
  nextState
) {
  if (
    !Object.values(
      CONVERSATION_STATES
    ).includes(nextState)
  ) {
    throw new Error(
      `État conversationnel invalide : ${nextState}`
    );
  }

  currentState = nextState;

  listeners.forEach(
    (listener) => {
      try {
        listener(currentState);
      } catch (error) {
        console.error(
          "Erreur listener ConversationState :",
          error
        );
      }
    }
  );

  return currentState;
}

export function subscribeConversationState(
  listener
) {
  if (
    typeof listener !== "function"
  ) {
    return () => {};
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function isConversationState(
  state
) {
  return currentState === state;
}