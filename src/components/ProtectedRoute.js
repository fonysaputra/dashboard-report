// src/components/ProtectedRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Use `null` to indicate the loading state
    const token = localStorage.getItem('token'); // Check for the token in local storage
    const [showPopup, setShowPopup] = useState(false); // Popup visibility

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

                if (response.status === 200) {
                    setIsAuthenticated(true); // Token is valid
                } else {
                    setIsAuthenticated(false); // Token is invalid
                    localStorage.removeItem("token"); // Clear invalid token
                    setShowPopup(true); // Show popup
                }
            } catch (error) {
                console.error("Error validating token:", error);
                setIsAuthenticated(false); // Assume unauthenticated on error
                setShowPopup(true); // Show popup
            }
        };

        if (token) {
            validateToken();
        } else {
            setIsAuthenticated(false); // No token present
            setShowPopup(true); // No token, show popup
        }
    }, [token]);

    // Handle redirect after popup confirmation
    const handleRedirect = () => {
        localStorage.removeItem("token");
        window.location.href = "/sign-in"; // Redirect to sign-in
    };

    // If `isAuthenticated` is `null`, show a loading indicator
    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }


    // Render the modal if the user is unauthorized
    if (showPopup) {
        return (
            <div className="modal-overlay">
                <div className="modal">
                    <h2>Session Expired</h2>
                    <p>Your session has expired. Please sign in again to continue.</p>
                    <button onClick={handleRedirect}>Go to Sign-In</button>
                </div>
            </div>
        );
    }

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
