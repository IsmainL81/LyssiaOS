/**
 * =====================================================
 * LYSSIA OS
 * Module : LyssiaCore
 * Version : 2.0
 * =====================================================
 */
import {
  CONVERSATION_STATES,
  getConversationState,
  setConversationState,
  subscribeConversationState,
} from "./ConversationState";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createInitialStatus } from "./StatusEngine";

const LyssiaContext =
  createContext(null);

const MEMORY_STORAGE_KEY =
  "lyssia_os_memory";

function loadMemories() {
  try {
    const stored =
      localStorage.getItem(
        MEMORY_STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Erreur chargement mémoire Lyssia :",
      error
    );

    return [];
  }
}

export function LyssiaProvider({
  
  children,
}) {
  /*
   * =====================================================
   * ÉTAT SYSTÈME
   * =====================================================
   */

  const [
    systemState,
    setSystemState,
  ] = useState(
    createInitialStatus()
  );

  const [
  conversationState,
  setConversationStateReact,
] = useState(
  getConversationState()
);

useEffect(() => {
  return subscribeConversationState(
    (nextState) => {
      setConversationStateReact(
        nextState
      );
    }
  );
}, []);

  /*
   * =====================================================
   * MESSAGE SYSTÈME
   * =====================================================
   */

  const [
    statusMessage,
    setStatusMessage,
  ] = useState(
    "Bonjour Ismain. Heureuse de te retrouver."
  );

  /*
   * =====================================================
   * MÉMOIRE
   * =====================================================
   */

  const [
    memories,
    setMemories,
  ] = useState(
    loadMemories
  );

  const [
  visionEvents,
  setVisionEvents,
] = useState([]);

  /*
   * =====================================================
   * SAUVEGARDE AUTOMATIQUE
   * =====================================================
   */

  useEffect(() => {
    try {
      localStorage.setItem(
        MEMORY_STORAGE_KEY,
        JSON.stringify(memories)
      );
    } catch (error) {
      console.error(
        "Erreur sauvegarde mémoire Lyssia :",
        error
      );
    }
  }, [memories]);

  /*
   * =====================================================
   * AJOUTER UN SOUVENIR
   * =====================================================
   */

  function addMemory({
    content,
    type = "general",
    importance = "normal",
    source = "user",
    metadata = {},
  }) {
    if (
      !content ||
      !String(content).trim()
    ) {
      return null;
    }

    const memory = {
      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,

      content:
        String(content).trim(),

      type,

      importance,

      source,

      metadata,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };

    setMemories(
      (previous) => [
        memory,
        ...previous,
      ]
    );

    return memory;
  }

  /*
   * =====================================================
   * AJOUTER UNE PERCEPTION VISUELLE
   * =====================================================
   */

  function addVisionMemory(
    description,
    metadata = {}
  ) {
    return addMemory({
      content:
        description,

      type:
        "vision",

      importance:
        "normal",

      source:
        "vision",

      metadata,
    });
  }

  function addVisionEvent({
  type = "change",
  message,
  difference = null,
}) {
  if (
    !message ||
    !String(message).trim()
  ) {
    return null;
  }

  const event = {
    id:
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,

    type,

    message:
      String(message).trim(),

    difference,

    createdAt:
      new Date().toISOString(),
  };

  setVisionEvents(
    (previous) => [
      event,
      ...previous,
    ].slice(0, 30)
  );

  return event;
}

  /*
   * =====================================================
   * AJOUTER UN SOUVENIR CONVERSATIONNEL
   * =====================================================
   */

  function addConversationMemory(
    content,
    metadata = {}
  ) {
    return addMemory({
      content,

      type:
        "conversation",

      importance:
        "normal",

      source:
        "chat",

      metadata,
    });
  }

  /*
   * =====================================================
   * RECHERCHER DANS LA MÉMOIRE
   * =====================================================
   */

  function searchMemories(
    query
  ) {
    if (
      !query ||
      !String(query).trim()
    ) {
      return memories;
    }

    const normalizedQuery =
      String(query)
        .toLowerCase()
        .trim();

    return memories.filter(
      (memory) =>
        memory.content
          ?.toLowerCase()
          .includes(
            normalizedQuery
          ) ||
        memory.type
          ?.toLowerCase()
          .includes(
            normalizedQuery
          )
    );
  }

  /*
   * =====================================================
   * SUPPRIMER UN SOUVENIR
   * =====================================================
   */

  function deleteMemory(
    memoryId
  ) {
    setMemories(
      (previous) =>
        previous.filter(
          (memory) =>
            memory.id !==
            memoryId
        )
    );
  }

  /*
   * =====================================================
   * EFFACER LA MÉMOIRE
   * =====================================================
   */

  function clearMemories() {
    setMemories([]);
  }

  /*
   * =====================================================
   * RÉCUPÉRER LES SOUVENIRS RÉCENTS
   * =====================================================
   */

  function getRecentMemories(
    limit = 10
  ) {
    return memories.slice(
      0,
      limit
    );
  }

  /*
   * =====================================================
   * CONTEXTE GLOBAL
   * =====================================================
   */

  const value = useMemo(
    () => ({
      /*
       * Système
       */

      systemState,
      setSystemState,

      /*
 * État conversationnel
 */

      conversationState,

      updateConversationState:
      setConversationState,

      statusMessage,
      setStatusMessage,

      /*
       * Mémoire
       */

      memories,

      addMemory,

      addVisionMemory,

      addConversationMemory,

      searchMemories,

      deleteMemory,

      clearMemories,

      getRecentMemories,

      visionEvents,

      addVisionEvent,
    }),
    [
      systemState,
      conversationState,
      statusMessage,
      memories,
      visionEvents,
    ]
  );

  return (
    <LyssiaContext.Provider

      value={value}
    >
      {children}
    </LyssiaContext.Provider>
  );
}

/*
 * =====================================================
 * HOOK
 * =====================================================
 */

export function useLyssia() {
  const context =
    useContext(
      LyssiaContext
    );

  if (!context) {
    throw new Error(
      "useLyssia doit être utilisé dans LyssiaProvider."
    );
  }

  return context;
}