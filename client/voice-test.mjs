import { debugSplitSpeechText } from "./src/features/voice/VoiceEngine.js";

const text = `On voit une seule personne au premier plan, torse nu, légèrement penchée vers l'appareil photo ; le visage est très proche de l'objectif. La personne est centrée dans l'image et occupe une grande partie du cadre.`;

const chunks = debugSplitSpeechText(text);

console.log("Nombre de chunks :", chunks.length);

chunks.forEach((chunk, index) => {
  console.log(`\nCHUNK ${index + 1} — ${chunk.length} caractères`);
  console.log(chunk);
});
