import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import AppRoute from '../AppRoute';
import { clerk } from '../Library/clerk';
import Register from './Register';
import ForgetPassword from './ForgetPassword';
import { loadClerk } from '../Library/clerk';

const SecurityCheck = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading

  useEffect(() => {
    const init = async () => {
      try {
        await loadClerk(); // Wait for Clerk to load
        setIsReady(true);

        // Now check auth status
        const isAuthenticated = !!clerk.user;
            console.log(clerk.user);
        setIsLoggedIn(isAuthenticated);
      } catch (err) {
        console.error("Failed to load Clerk:", err);
        setIsLoggedIn(false);
      }
    };

    init();
  }, []);

  // Show loading screen while waiting
  if (!isReady || isLoggedIn === null) {
    return <div></div>;
  }

  // Render routes based on login status
  return isLoggedIn ? (
    <AppRoute />
  ) : (
    <Routes>
      <Route path="/*" element={<Login />} />
      <Route path="/register*" element={<Register />} />
      <Route path="/forget-password*" element={<ForgetPassword />} />
    </Routes>
  );
};

export default SecurityCheck;
