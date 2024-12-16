// src/components/ProtectedRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Use `null` to indicate the loading state
    const token = localStorage.getItem('token'); // Check for the token in local storage


  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/case/room/all?page=1&limit=1`,   {
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
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setIsAuthenticated(false); // Assume unauthenticated on error
      }
    };

    if (token) {
      validateToken();
    } else {
      setIsAuthenticated(false); // No token present
    }
  }, [token]);
    // If `isAuthenticated` is `null`, show a loading indicator
    if (isAuthenticated === null) {
        return <div>Loading...</div>;
      }
    
    return (
        <Route
            {...rest}
            render={(props) => 
                isAuthenticated  ? (
                    <Component {...props} /> // Render the component if token exists
                ) : (
                    <Redirect to="/sign-in" /> // Redirect to sign-in if no token
                )
            }
        />
    );
};

export default ProtectedRoute;
