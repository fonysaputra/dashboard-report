// src/components/ProtectedRoute.js
import React, { useEffect, useState }  from 'react';
import { Route, Redirect } from 'react-router-dom';

import { message } from "antd";

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Use `null` to indicate the loading state
    const token = localStorage.getItem('token'); // Check for the token in local storage


    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/case/room/all?page=1&limit=1`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Check if the response status is 401 (Unauthorized)
                if (response.status === 401) {
                    message.error("Session Expired.");
                    localStorage.removeItem("token"); // Remove the token from local storage
                    window.location.href = "/sign-in"; // Redirect to the login page
                    return; // Stop further execution
                }

                if (response.status === 200) {
                    setIsAuthenticated(true); // Token is valid
                } else {
                    setIsAuthenticated(false); // Token is invalid
                    localStorage.removeItem("token"); // Clear invalid token
                }
            } catch (error) {
            }
        };

        if (token) {
            validateToken();
        } else {
            localStorage.removeItem("token"); // Remove the token from local storage
            setIsAuthenticated(false); // No token present
        }
    }, [token]);

    return (
        <Route
            {...rest}
            render={(props) =>
                isAuthenticated ? (
                    <Component {...props} /> // Render the component if token exists
                ) : (
                    <Redirect to="/sign-in" /> // Redirect to sign-in if no token
                )
            }
        />
    );
};

export default ProtectedRoute;
