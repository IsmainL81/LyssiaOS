/**
 * =====================================================
 * LYSSIA OS
 * Conversation Context Engine
 * Version : 2.1
 * =====================================================
 *
 * Contexte conversationnel actif.
 *
 * Ce module ne remplace pas la mémoire de Lyssia.
 * Il maintient le fil actif entre les tours.
 * =====================================================
 */

export const INITIAL_CONVERSATION_CONTEXT = {
  activeTopic: null,
  activeTask: null,
  activeObject: null,
  activeLanguage: null,
  lastUserRequest: null,
  lastAssistantQuestion: null,
  pendingContinuation: false,
  updatedAt: null,
};

export function createInitialConversationContext() {
  return {
    ...INITIAL_CONVERSATION_CONTEXT,
  };
}

export function updateConversationContext(
  previousContext = INITIAL_CONVERSATION_CONTEXT,
  patch = {}
) {
  return {
    ...previousContext,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}

export function resetConversationContext() {
  return createInitialConversationContext();
}

function normalize(text = "") {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}'\s?]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectLanguage(text = "") {
  const normalized = normalize(text);

  const languages = [
    "francais",
    "anglais",
    "swahili",
    "espagnol",
    "allemand",
    "italien",
    "portugais",
    "neerlandais",
    "arabe",
    "japonais",
    "chinois",
    "russe",
  ];

  return (
    languages.find((language) =>
      normalized.includes(language)
    ) || null
  );
}

function detectTask(text = "") {
  const normalized = normalize(text);

  if (
    normalized.includes("tradui") ||
    normalized.includes("traduction") ||
    normalized.includes("dire en ")
  ) {
    return "translation";
  }

  if (
    normalized.includes("continue") ||
    normalized.includes("termine") ||
    normalized.includes("finis") ||
    normalized.includes("reprends")
  ) {
    return "continuation";
  }

  if (
    normalized.includes("explique") ||
    normalized.includes("expliquer")
  ) {
    return "explanation";
  }

  if (
    normalized.includes("analyse") ||
    normalized.includes("analyser")
  ) {
    return "analysis";
  }

  return null;
}

function detectReference(text = "") {
  const normalized = normalize(text);

  if (
    normalized.includes("phrase precedente") ||
    normalized.includes("phrase que tu viens de dire") ||
    normalized.includes("ce que tu viens de dire") ||
    normalized.includes("ce que tu as dit") ||
    normalized.includes("ce que je t'ai dit")
  ) {
    return "previous_phrase";
  }

  if (
    normalized === "ca" ||
    normalized.includes(" cela ") ||
    normalized.includes(" cette phrase") ||
    normalized.includes(" celle ci")
  ) {
    return "previous_context";
  }

  return null;
}

function detectContinuation(text = "") {
  const normalized = normalize(text);

  return (
    normalized === "oui" ||
    normalized === "non" ||
    normalized === "continue" ||
    normalized.includes("termine ta phrase") ||
    normalized.includes("tu terminais ta phrase") ||
    normalized.includes("reprends")
  );
}

function detectAssistantQuestion(response = "") {
  if (
    !response ||
    typeof response !== "string" ||
    !response.trim()
  ) {
    return null;
  }

  const questionPatterns = [
    /\?$/,
    /^(peux-tu|veux-tu|souhaites-tu|dois-je)/i,
  ];

  const lines = response
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const lastLine =
    lines[lines.length - 1] || "";

  return questionPatterns.some((pattern) =>
    pattern.test(lastLine)
  )
    ? lastLine
    : null;
}

export function deriveConversationContext({
  message = "",
  response = "",
  cognition = null,
  previousContext = INITIAL_CONVERSATION_CONTEXT,
} = {}) {
  const normalized = normalize(message);

  if (!normalized) {
    return updateConversationContext(
      previousContext
    );
  }

  const task =
    detectTask(message);

  const language =
    detectLanguage(message);

  const reference =
    detectReference(message);

  const continuation =
    detectContinuation(message);

  let activeTask =
    task ||
    previousContext.activeTask;

  let activeLanguage =
    language ||
    previousContext.activeLanguage;

  let activeObject =
    previousContext.activeObject;

  let pendingContinuation =
    previousContext.pendingContinuation;

  let lastAssistantQuestion =
    previousContext.lastAssistantQuestion;

  if (reference === "previous_phrase") {
    activeObject = "previous_phrase";
  }

  if (reference === "previous_context") {
    activeObject =
      previousContext.activeObject ||
      "previous_context";
  }

  if (task === "translation") {
    activeObject =
      activeObject ||
      "previous_phrase";
  }

  if (
    task === "continuation" ||
    continuation ||
    cognition?.possibleRepetition === true
  ) {
    pendingContinuation = true;
  }

  const detectedQuestion =
    detectAssistantQuestion(response);

  if (detectedQuestion) {
    lastAssistantQuestion =
      detectedQuestion;
  }

  return updateConversationContext(
    previousContext,
    {
      activeTopic:
        previousContext.activeTopic ||
        cognition?.intent ||
        null,

      activeTask,

      activeObject,

      activeLanguage,

      lastUserRequest:
        message,

      pendingContinuation,

      lastAssistantQuestion,
    }
  );
}
