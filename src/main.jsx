import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  HashRouter as Router,
} from "react-router-dom";
import '../node_modules/unygc/package/index.css';
import '../public/Theme.css';
import './index.css';
import SecurityCheck from './LoginRegister/index.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
const PUBLISHABLE_KEY = "pk_test_c2VjdXJlLWNoaWNrZW4tNTAuY2xlcmsuYWNjb3VudHMuZGV2JA";//"pk_test_bGlnaHQtaWd1YW5hLTgzLmNsZXJrLmFjY291bnRzLmRldiQ";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <SecurityCheck />
      </Router>
    </ClerkProvider>
  </StrictMode>
);
