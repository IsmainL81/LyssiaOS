import {
  useEffect,
  useState,
} from "react";

import MainLayout from "./components/Layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Vision from "./pages/Vision";
import Memory from "./pages/Memory";
import Conversation from "./pages/Conversation";

import {
  VisionProvider,
} from "./features/vision/VisionContext";

function getCurrentPath() {
  return window.location.pathname;
}

export default function App() {
  const [path, setPath] =
    useState(getCurrentPath);

  useEffect(() => {
    function handleNavigation() {
      setPath(
        getCurrentPath()
      );
    }

    window.addEventListener(
      "popstate",
      handleNavigation
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handleNavigation
      );
    };
  }, []);

  let page;

  switch (path) {
    case "/conversation":
      page = <Conversation />;
      break;

    case "/vision":
      page = <Vision />;
      break;

    case "/memory":
      page = <Memory />;
      break;

    case "/":
    case "/dashboard":
    default:
      page = <Dashboard />;
      break;
  }

  return (
    <VisionProvider>
      <MainLayout>
        {page}
      </MainLayout>
    </VisionProvider>
  );
}