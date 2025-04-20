import { Switch, Route, Redirect } from "react-router-dom";
import Home from "./pages/Home";
import Tables from "./pages/Tables";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Main from "./components/layout/Main";
import ProtectedRoute from "./components/ProtectedRoute"; // Import the ProtectedRoute component

import UserList from "./pages/UsersList"; // Import the UserList component
import CaseList from "./pages/ReportCase"; // Import the UserList component
import "antd/dist/antd.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import TitleList from "./pages/TitlePage";
import RoomList from "./pages/RoomPage";
import SummaryReport from "./pages/SummaryReport";

const resizeObserverErr = window.onerror;
window.onerror = function(message, source, lineno, colno, error) {
    if (message === "ResizeObserver loop completed with undelivered notifications.") {
        return true; // Suppress error
    }
    return resizeObserverErr(message, source, lineno, colno, error);
};

function App() {
    
    return (
        <div className="App">
            <Switch>
                <Route path="/sign-up" exact component={SignUp} />
                <Route path="/sign-in" exact component={SignIn} />
                <Main>
                    <ProtectedRoute exact path="/dashboard" component={Home} />
                    <ProtectedRoute exact path="/tables" component={Tables} />
                    <ProtectedRoute exact path="/profile" component={Profile} />
                    <ProtectedRoute exact path="/users" component={UserList} />
                    <ProtectedRoute exact path="/report-case" component={CaseList} />
                    <ProtectedRoute exact path="/master-data-title" component={TitleList} />
                    <ProtectedRoute exact path="/master-data-room" component={RoomList} />
                    
                    <ProtectedRoute exact path="/summary-report" component={SummaryReport} />
                    <Redirect from="*" to="/dashboard" />
                </Main>
            </Switch>
        </div>
    );
}

export default App;
