import React from "react";
import { createRoot } from "react-dom/client";  // Updated import
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Create a root and render
const root = createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);