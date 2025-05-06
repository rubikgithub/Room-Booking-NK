import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  HashRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import './index.css';
import { UnyProtect } from "unygc";
import SecurityCheck from './LoginRegister/index.jsx';
import AppRoute from "./AppRoute.jsx";

const publishKey = 'pk_test_bGlnaHQtaWd1YW5hLTgzLmNsZXJrLmFjY291bnRzLmRldiQ';
UnyProtect.register(publishKey);

// Configuration.setapi("https://curiousrubik.us/dev/pmsdevapi.php?gyu=");
// Configuration.setup({
//   editFieldHelp:true
// })


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SecurityCheck>
      <Router>
        <Routes>
          <Route
            path="*"
            element={<AppRoute />}
          />
        </Routes>
      </Router>
    </SecurityCheck>
  </StrictMode>,
)