/**
 * =====================================================
 * LYSSIA OS
 * Module : Status Engine
 * Version : 1.1
 * =====================================================
 *
 * Centralise les états des différents systèmes
 * de Lyssia OS.
 *
 * Les composants visuels ne doivent pas inventer
 * leurs propres états : ils lisent ceux définis ici.
 * =====================================================
 */

export const STATUS = {
  ONLINE: "online",
  LISTENING: "listening",
  THINKING: "thinking",
  SPEAKING: "speaking",
  OFFLINE: "offline",
  ERROR: "error",
  WAITING: "waiting",
};

export const MODULES = {
  AI: "ai",
  AVATAR: "avatar",
  MEMORY: "memory",
  ROBOT: "robot",
  VISION: "vision",
  VOICE: "voice",
};

export const STATUS_META = {
  [STATUS.ONLINE]: {
    label: "Présente",
    color: "#59f5a0",
  },

  [STATUS.LISTENING]: {
    label: "Écoute",
    color: "#ffd166",
  },

  [STATUS.THINKING]: {
    label: "En réflexion",
    color: "#b77cff",
  },

  [STATUS.SPEAKING]: {
    label: "Parle",
    color: "#59d9ff",
  },

  [STATUS.OFFLINE]: {
    label: "Hors ligne",
    color: "#64748b",
  },

  [STATUS.ERROR]: {
    label: "Erreur",
    color: "#ff647c",
  },

  [STATUS.WAITING]: {
    label: "En attente",
    color: "#94a3b8",
  },
};

export function createInitialStatus() {
  return {
    ai: STATUS.ONLINE,
    avatar: STATUS.ONLINE,
    memory: STATUS.ONLINE,
    vision: STATUS.WAITING,
    robot: STATUS.OFFLINE,
    voice: STATUS.OFFLINE,
  };
}

export function getStatusMeta(status) {
  return (
    STATUS_META[status] ||
    STATUS_META[STATUS.WAITING]
  );
}