#!/bin/bash
set -e

# À lancer depuis la racine de ton clone local de LyssiaOS,
# sur la branche master, à jour avec origin/master (commit 78675d1b).

git rm "client/src/_encoding_backup/CameraView.jsx"
git rm "client/src/_encoding_backup/ChatPanel.jsx"
git rm "client/src/_encoding_backup/VoiceEngine.js"
git rm "client/src/_encoding_backup_clean/CameraView.jsx"
git rm "client/src/_encoding_backup_clean/ChatPanel.jsx"
git rm "client/src/_encoding_backup_clean/Sidebar.jsx"
git rm "client/src/_encoding_backup_clean/VoiceEngine.js"
git rm "client/src/_encoding_backup_clean/server.js"
git rm "client/src/components/Dashboard.jsx"
git rm "client/src/core/CognitiveEngine.V1.validated.js"
git rm "client/src/core/CognitiveEngine.v1-observationOK.js"
git rm "client/src/core/CognitiveEngine.v1.js"
git rm "client/src/core/CognitiveEngine.v1.jsx"
git rm "client/src/features/ai/ChatPanel.backup.jsx"
git rm "client/src/features/ai/ChatPanel.beforeCognitiveV2.jsx"
git rm "client/src/features/ai/ChatPanel.cognitive.validated.jsx"
git rm "client/src/features/ai/ChatPanel.cognitiveObservationOK.jsx"
git rm "client/src/features/ai/ChatPanel.jsx.bak"
git rm "client/src/features/voice/VoiceEngine.v1.backup.js"
git rm "client/src/pages/Dashboard.audioOK.jsx"
git rm "client/src/pages/Dashboard.backup.jsx"
git rm "client/src/pages/Dashboard.beforeAudioWaveCleanup.jsx"
git rm "client/src/pages/Dashboard.beforeCalculatorCleanup.jsx"
git rm "client/src/pages/Dashboard.beforeCalculatorCleanup2.jsx"
git rm "client/src/pages/Dashboard.beforeCalculatorRemove.jsx"
git rm "client/src/pages/Dashboard.beforeContext.jsx"
git rm "client/src/pages/Dashboard.beforeDuplicateRemoval.jsx"
git rm "client/src/pages/Dashboard.beforeInteractions.jsx"
git rm "client/src/pages/Dashboard.beforeMemoryCleanup.jsx"
git rm "client/src/pages/Dashboard.beforeQuickTools.jsx"
git rm "client/src/pages/Dashboard.beforeSidebarCleanup.jsx"
git rm "client/src/pages/Dashboard.beforeSystemStatus.jsx"
git rm "client/src/pages/Dashboard.beforeSystemStatusFunctionCleanup.jsx"
git rm "client/src/pages/Dashboard.beforeSystemStatusFunctionCleanup2.jsx"
git rm "client/src/pages/Dashboard.calculatorOK.jsx"
git rm "client/src/pages/Dashboard.chatBase.jsx"
git rm "client/src/pages/Dashboard.chatOK.jsx"
git rm "client/src/pages/Dashboard.contextOK.jsx"
git rm "client/src/pages/Dashboard.interactionsOK.jsx"
git rm "client/src/pages/Dashboard.memoryOK.jsx"
git rm "client/src/pages/Dashboard.modularOK.jsx"
git rm "client/src/pages/Dashboard.preVisionFix.jsx"
git rm "client/src/pages/Dashboard.sidebarOK.jsx"
git rm "client/src/pages/Dashboard.toolsOK.jsx"

git commit -m 'cleanup: remove 44 dead file-copy checkpoints

Variants of Dashboard/ChatPanel/CognitiveEngine(v1)/VoiceEngine/CameraView/
Sidebar kept as separate files instead of git history. Verified via import
tracing that none are referenced by the live app (App -> Dashboard ->
ChatPanel -> CognitiveEngine.js/VoiceEngine.js -> CameraView.jsx,
MainLayout -> Sidebar.jsx). Also removes _encoding_backup and
_encoding_backup_clean folders (pre-fix snapshots from a past encoding
incident).

Kept: CognitiveEngine.v2.js, CognitiveEngine.v2.test.js,
CognitiveExecutor.js, CognitiveExecutor.test.js -- confirmed active v2
work-in-progress, not yet wired into ChatPanel.jsx.'

echo "Terminé. Vérifie avec : cd client && npm run build"
echo "Puis : git push origin master"
