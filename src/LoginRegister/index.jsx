import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import AppRoute from '../AppRoute';
import { clerk, loadClerk } from '../LoginRegister/clerk';
import Register from './Register';
import ForgetPassword from './ForgetPassword';
import { $ajax_post } from '../Library';

const SecurityCheck = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading

  useEffect(() => {
    const init = async () => {
      try {
        await loadClerk(); // Wait for Clerk to load
        setIsReady(true);

        // Now check auth status
        // const isAuthenticated = !!clerk.user;
        //     console.log(clerk.user);
        // setIsLoggedIn(isAuthenticated);
        if(clerk.user){
            //user_2wogJroXsrv2qL3Yufp2POUpLlS
            $ajax_post(`getUser/${clerk.user.id}`, {}, function (response) {
                console.log(response?.role, 'userssss');
                localStorage.setItem('role', response?.role);
                setIsLoggedIn(true);
            });
        
        }else{
          setIsLoggedIn(false);
        }
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
