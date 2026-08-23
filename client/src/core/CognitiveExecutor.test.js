import {
  orchestrateCognition,
} from "./CognitiveEngine.v2.js";

import {
  executeCognitivePlan,
} from "./CognitiveExecutor.js";

const tests = [
  "Bonjour Lyssia",
  "Tu te souviens de notre projet ?",
  "Regarde ce que je te montre",
  "Arrête la vision",
];

for (const message of tests) {
  const plan =
    orchestrateCognition({
      message,
      memories: [],
    });

  const result =
    executeCognitivePlan(
      plan,
      {
        onChat: (currentPlan) => ({
          handler: "chat",
          message: currentPlan.message,
        }),

        onMemory: (currentPlan) => ({
          handler: "memory",
          message: currentPlan.message,
        }),

        onVision: (currentPlan) => ({
          handler: "vision",
          message: currentPlan.message,
        }),

        onCommand: (currentPlan) => ({
          handler: "command",
          message: currentPlan.message,
        }),

        onStop: (currentPlan) => ({
          handler: "stop",
          message: currentPlan.message,
        }),
      }
    );

  console.log("\nMESSAGE :", message);
  console.log("PLAN :", {
    route: plan.route,
    action: plan.action,
  });
  console.log("EXECUTION :", result);
}
