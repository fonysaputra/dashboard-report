// src/components/ProtectedRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const token = localStorage.getItem('token'); // Check for the token in local storage

    return (
        <Route
            {...rest}
            render={(props) => 
                token ? (
                    <Component {...props} /> // Render the component if token exists
                ) : (
                    <Redirect to="/sign-in" /> // Redirect to sign-in if no token
                )
            }
        />
    );
};

export default ProtectedRoute;
