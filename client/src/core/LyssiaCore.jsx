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
  createInitialConversationContext,
  updateConversationContext as applyConversationContextUpdate,
  resetConversationContext,
} from "./ConversationContextEngine.js";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createInitialStatus } from "./StatusEngine";

import { askMemoryExtraction } from "../features/ai/AIEngine";
import {
  createExperimentRegistry,
  registerExperiment,
  findActiveSimilarExperiment,
  registerExperimentObservation,
  updateExperiment,
} from "./CognitiveExperimentRegistry.js";

const LyssiaContext =
  createContext(null);

const MEMORY_STORAGE_KEY =
  "lyssia_os_memory";
const EXPERIMENT_STORAGE_KEY =
  "lyssia_os_experiments";
const COGNITIVE_HISTORY_STORAGE_KEY =
  "lyssia_os_cognitive_history";

function loadExperiments() {
  try {
    const stored =
      localStorage.getItem(
        EXPERIMENT_STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return createExperimentRegistry(
      parsed
    );
  } catch (error) {
    console.error(
      "Erreur chargement expériences Lyssia :",
      error
    );

    return [];
  }
}
function loadCognitiveHistory() {
  try {
    const stored =
      localStorage.getItem(
        COGNITIVE_HISTORY_STORAGE_KEY
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
      "Erreur chargement historique cognitif Lyssia :",
      error
    );

    return [];
  }
}
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
   * CONTEXTE CONVERSATIONNEL ACTIF
   * =====================================================
   */

  const [
    conversationContext,
    setConversationContextState,
  ] = useState(
    createInitialConversationContext
  );

  function updateActiveConversationContext(
    patch = {}
  ) {
    setConversationContextState(
      (previousContext) =>
        applyConversationContextUpdate(
          previousContext,
          patch
        )
    );
  }

  function resetActiveConversationContext() {
    setConversationContextState(
      resetConversationContext()
    );
  }

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
   * ÉTAT COGNITIF
   * =====================================================
   */

  const [
    cognitiveState,
    setCognitiveState,
  ] = useState(null);

  const [
    cognitiveHistory,
    setCognitiveHistory,
  ] = useState(
    loadCognitiveHistory
  );

  const [
    operationalIndex,
    setOperationalIndex,
  ] = useState(null);
  const [
    experimentRegistry,
    setExperimentRegistry,
  ] = useState(
    loadExperiments
  );

  function updateCognitiveState({
    state = null,
    history = null,
    operationalIndex = null,
  } = {}) {
    if (state) {
      setCognitiveState(state);
    }

    if (Array.isArray(history)) {
      setCognitiveHistory(history);
    }

    if (operationalIndex) {
      setOperationalIndex(
        operationalIndex
      );
    }
  }

  function registerCognitiveExperiment(
    experiment
  ) {
    setExperimentRegistry((current) => {
      const existing =
        findActiveSimilarExperiment(
          current,
          {
            target: experiment?.target,
            mode: experiment?.mode,
          }
        );

      if (existing) {
        return current;
      }

      return registerExperiment(
        current,
        experiment
      );
    });
  }

  function registerCognitiveExperimentObservation(
    experimentId,
    observation = {}
  ) {
    setExperimentRegistry(
      (current) =>
        registerExperimentObservation(
          current,
          experimentId,
          observation
        )
    );
  }

  function updateCognitiveExperiment(
    experimentId,
    patch = {}
  ) {
    setExperimentRegistry(
      (current) =>
        updateExperiment(
          current,
          experimentId,
          patch
        )
    );
  }
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
  useEffect(() => {
    try {
      localStorage.setItem(
        COGNITIVE_HISTORY_STORAGE_KEY,
        JSON.stringify(
          cognitiveHistory
        )
      );
    } catch (error) {
      console.error(
        "Erreur sauvegarde historique cognitif Lyssia :",
        error
      );
    }
  }, [cognitiveHistory]);
  useEffect(() => {
    try {
      localStorage.setItem(
        EXPERIMENT_STORAGE_KEY,
        JSON.stringify(
          experimentRegistry
        )
      );
    } catch (error) {
      console.error(
        "Erreur sauvegarde expériences Lyssia :",
        error
      );
    }
  }, [experimentRegistry]);

  /*
   * =====================================================
   * AJOUTER UN SOUVENIR
   * =====================================================
   */

  function addMemory({
    content,
    type = "general",
    category = "episodic",
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

      /*
       * category distingue le rôle cognitif du souvenir :
       * "episodic"  -> un événement vécu (conversation, vision)
       * "semantic"  -> un fait durable extrait, indépendant
       *                de l'échange qui l'a produit
       *
       * La mémoire de travail n'est pas stockée ici : elle
       * est assemblée à la volée par buildWorkingContext().
       */

      category,

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

      category:
        "episodic",

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

      category:
        "episodic",

      importance:
        "normal",

      source:
        "chat",

      metadata,
    });
  }

  /*
   * =====================================================
   * MÉMOIRE SÉMANTIQUE
   * =====================================================
   * Faits durables, indépendants de l'échange d'origine --
   * pas "Ismain a dit qu'il prépare l'IOBSP1" (episodic)
   * mais "Ismain prépare l'IOBSP1" (semantic).
   */

  function addSemanticMemory(
    content,
    metadata = {}
  ) {
    return addMemory({
      content,

      type:
        "fact",

      category:
        "semantic",

      importance:
        "high",

      source:
        "extraction",

      metadata,
    });
  }

  async function extractSemanticMemories(
    userMessage,
    assistantResponse
  ) {
    try {
      const rawFacts =
        await askMemoryExtraction(
          userMessage,
          assistantResponse
        );

      if (
        !rawFacts ||
        rawFacts.trim().toUpperCase() ===
          "AUCUN"
      ) {
        return;
      }

      const facts = rawFacts
        .split("\n")
        .map((line) => line.trim())
        .filter((line) =>
          line.startsWith("-")
        )
        .map((line) =>
          line.replace(/^-+\s*/, "").trim()
        )
        .filter(Boolean);

      facts.forEach((fact) => {
        const alreadyKnown =
          memories.some(
            (memory) =>
              memory.category ===
                "semantic" &&
              memory.content.toLowerCase() ===
                fact.toLowerCase()
          );

        if (!alreadyKnown) {
          addSemanticMemory(fact);
        }
      });
    } catch (error) {
      console.warn(
        "Extraction mémoire sémantique impossible :",
        error
      );
    }
  }

  /*
   * =====================================================
   * SE SOUVENIR D'UN ÉCHANGE (point d'entrée unique)
   * =====================================================
   * Utilisé par ChatPanel (texte) ET Conversation (voix) --
   * un seul chemin vers la mémoire, quelle que soit la
   * modalité d'interaction.
   */

  function rememberExchange(
    userMessage,
    assistantResponse
  ) {
    if (
      !userMessage?.trim() ||
      !assistantResponse?.trim()
    ) {
      return;
    }

    /*
     * Évite d'enregistrer les échanges très courts
     * du genre "ok", "oui", "merci".
     */

    if (
      userMessage.trim().length <
      4
    ) {
      return;
    }

    try {
      addConversationMemory(
        `Utilisateur : ${userMessage.trim()}\nLyssia : ${assistantResponse.trim()}`,
        {
          timestamp:
            new Date().toISOString(),
        }
      );
    } catch (error) {
      console.warn(
        "Impossible de mémoriser la conversation :",
        error
      );
    }

    /*
     * Extraction sémantique en arrière-plan -- ne bloque
     * jamais la conversation, échoue silencieusement.
     */

    extractSemanticMemories(
      userMessage.trim(),
      assistantResponse.trim()
    );
  }

  /*
   * =====================================================
   * RECHERCHER DANS LA MÉMOIRE
   * =====================================================
   */

  function searchMemories(
    query,
    { category } = {}
  ) {
    let result = memories;

    if (category) {
      result = result.filter(
        (memory) =>
          memory.category === category
      );
    }

    if (
      !query ||
      !String(query).trim()
    ) {
      return result;
    }

    const normalizedQuery =
      String(query)
        .toLowerCase()
        .trim();

    return result.filter(
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
   * MÉMOIRE DE TRAVAIL (assemblée, pas stockée)
   * =====================================================
   * Contexte actuel pour le tour en cours : les événements
   * récents + les faits sémantiques pertinents. C'est ce
   * qui alimente cognitiveContext côté serveur.
   */

  function buildWorkingContext({
    query = "",
    recentLimit = 5,
    semanticLimit = 5,
  } = {}) {
    const recentEpisodic =
      getRecentMemories(recentLimit, {
        category: "episodic",
      });

    /*
     * Les faits sémantiques pertinents pour CE message
     * d'abord (recherche par mots-clés) ; complète avec
     * les plus récents pour ne jamais partir d'un
     * contexte vide juste parce que le message du jour
     * n'a aucun mot-clé en commun avec un fait établi.
     */

    const matchedSemantic = query
      ? searchMemories(query, {
          category: "semantic",
        })
      : [];

    const otherSemantic = memories.filter(
      (memory) =>
        memory.category === "semantic" &&
        !matchedSemantic.some(
          (matched) =>
            matched.id === memory.id
        )
    );

    const relevantSemantic = [
      ...matchedSemantic,
      ...otherSemantic,
    ].slice(0, semanticLimit);

    return {
      recentEpisodic,
      relevantSemantic,
    };
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
    limit = 10,
    { category } = {}
  ) {
    const source = category
      ? memories.filter(
          (memory) =>
            memory.category === category
        )
      : memories;

    return source.slice(
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

      conversationContext,

      updateConversationContext:
      updateActiveConversationContext,

      resetConversationContext:
      resetActiveConversationContext,

      statusMessage,
      setStatusMessage,

      /*
       * Mémoire
       */

      memories,

      addMemory,

      addVisionMemory,

      addConversationMemory,

      addSemanticMemory,

      extractSemanticMemories,

      rememberExchange,

      buildWorkingContext,

      searchMemories,

      deleteMemory,

      clearMemories,

      getRecentMemories,

      visionEvents,

      addVisionEvent,

      /*
       * État cognitif
       */

      cognitiveState,

      cognitiveHistory,

      operationalIndex,

      updateCognitiveState,

      /*
       * Registre expérimental
       */
      experimentRegistry,

      registerCognitiveExperiment,

      registerCognitiveExperimentObservation,

      updateCognitiveExperiment,
    }),
    [
      systemState,
      conversationState,
      conversationContext,
      statusMessage,
      memories,
      visionEvents,
      cognitiveState,
      cognitiveHistory,
      operationalIndex,
      experimentRegistry,
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