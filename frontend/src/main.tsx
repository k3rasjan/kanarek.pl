import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/input.css";
import App from "./App.tsx";
// import Login from "./Login.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
