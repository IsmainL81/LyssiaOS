import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";

import { LyssiaProvider } from "./core/LyssiaCore";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LyssiaProvider>
      <App />
    </LyssiaProvider>
  </StrictMode>
);
