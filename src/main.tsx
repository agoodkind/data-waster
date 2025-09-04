import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.css";
import DataWasterPage from "./pages/+Page";
import { CookiesProvider } from "react-cookie";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CookiesProvider>
      <DataWasterPage />
    </CookiesProvider>
  </StrictMode>
);
