import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import "./index.css";
import SecurityCheck from "./LoginRegister/index.jsx";
import { ClerkProvider } from "@clerk/clerk-react";

// const PUBLISHABLE_KEY = "pk_test_c2VjdXJlLWNoaWNrZW4tNTAuY2xlcmsuYWNjb3VudHMuZGV2JA";
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_c2VjdXJlLWNoaWNrZW4tNTAuY2xlcmsuYWNjb3VudHMuZGV2JA";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <SecurityCheck />
      </Router>
    </ClerkProvider>
  </StrictMode>
);
