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
