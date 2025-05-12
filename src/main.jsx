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

const PUBLISHABLE_KEY = import.meta.env.VITE_API_URL;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <SecurityCheck />
      </Router>
    </ClerkProvider>
  </StrictMode>
);
