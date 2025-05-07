import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AppRoute from '../AppRoute';
import { clerk } from '../Library/clerk';
import Register from './Register';
import ForgetPassword from './ForgetPassword';

const SecurityCheck = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(null); // use null to handle loading state

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoggedIn(!!clerk.user); // simple truthy check
        };

        setTimeout(checkAuth, 1000); // or await actual auth check
    }, []);


    return isLoggedIn ? (
        <AppRoute />
    ) : (
        <Routes>
            <Route path="/*" element={<Login />} />
            <Route path="/register*" element={< Register />} />
            <Route path="/forget-password*" element={< ForgetPassword />} />
        </Routes>
    );
};

export default SecurityCheck;
