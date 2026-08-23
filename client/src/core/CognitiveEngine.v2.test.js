import {
  orchestrateCognition,
} from "./CognitiveEngine.v2.js";

const tests = [
  "Bonjour Lyssia",
  "Que faisons-nous ensuite ?",
  "Tu te souviens de notre projet ?",
  "Regarde ce que je te montre",
  "Arrête la vision",
  "Arrête la caméra",
  "Lance la vision",


  "Tu peux me dire ce que tu vois ici ?",
  "Qu'est-ce que tu penses de ce que je viens de te montrer ?",
  "Est-ce que ça te rappelle quelque chose ?",
  "Tu te rappelles ce qu'on avait décidé hier ?",
  "Regarde cette image et dis-moi si tu reconnais quelque chose.",
];

for (const message of tests) {
  const plan =
    orchestrateCognition({
      message,
      memories: [],
    });

  console.log("\nMESSAGE :", message);
  console.dir(plan, {
    depth: 5,
  });
}
