
import React, { useEffect, useState } from 'react';
import { UnyProtect } from "unygc";
import Login from './login';


const SecurityCheck = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const fetchLoggedInUser = async () => {
        try {
            const loggedInUser = await UnyProtect.user();
            if (loggedInUser) {
                setIsLoggedIn(true);
            }
        } catch (err) {
            console.error("Error checking logged in user", err);
            setIsLoggedIn(false);
        }
    };

    useEffect(() => {
        fetchLoggedInUser();
        // Optional: observe UnyProtect for login completion
        const interval = setInterval(fetchLoggedInUser, 500); // poll for session
        return () => clearInterval(interval); // cleanup
    }, []);

    return (
        <>
            {isLoggedIn ? (
                <>{children}</>
            ) : <>
                <Login />
            </>}
        </>

    );
};

export default SecurityCheck;


