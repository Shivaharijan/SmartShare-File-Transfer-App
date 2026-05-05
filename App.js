import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./components/Home";
import Download from "./components/Download";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// import NotFound from "./components/NotFound";
import About from "./components/About";
import RecentFiles from "./pages/RecentFiles";
import Login from "./components/Login";
import Settings from "./pages/Settings";
import SharedFiles from "./pages/SharedFiles";
import { LanguageProvider } from "./context/LanguageContext";
import { SearchProvider } from "./context/SearchContext";

import Sidebar from "./components/Sidebar";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(
        localStorage.getItem("isAuthenticated") === "true"
    );
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 768);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Initialize Theme
    React.useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", storedTheme);
    }, []);

    const setAuth = (auth) => {
        setIsAuthenticated(auth);
        if (auth) {
            localStorage.setItem("isAuthenticated", "true");
        } else {
            localStorage.removeItem("isAuthenticated");
        }
    };

    const handleLogout = () => {
        setAuth(false);
        // Optionally redirect or clear other state
    };

    return (
        <LanguageProvider>
            <SearchProvider>
                <Router>
                    <Switch>
                        <Route
                            path="/login"
                            exact
                            render={(props) => <Login {...props} setAuth={setAuth} />}
                        />
                        <Route
                            path="/register"
                            exact
                            render={(props) => <Login {...props} setAuth={setAuth} />}
                        />

                        {/* Protected Routes Layout */}
                        {!isAuthenticated ? (
                            <Route render={(props) => <Login {...props} setAuth={setAuth} />} />
                        ) : (
                            <div style={{ display: "flex", backgroundColor: "var(--bg-dark)", minHeight: "100vh" }}>
                                <Sidebar logout={handleLogout} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                                <div className={`main-content ${isSidebarOpen ? "sidebar-open" : ""}`} 
                                style={{ flex: 1, transition: "margin-left 0.3s ease", display: "flex",
                                 flexDirection: "column", minHeight: "100vh" }}>
                                    <Navbar toggleSidebar={toggleSidebar} />
                                    <div style={{ flex: 1, width: "100%" }}>
                                        <Switch>
                                            <Route path="/" exact component={Home} />
                                            <Route path="/download/:id" exact component={Download} />
                                            <Route path="/about" exact component={About} />
                                            <Route path="/recent" exact component={RecentFiles} />
                                            <Route path="/shared" exact component={SharedFiles} />
                                            <Route
                                                path="/settings"
                                                exact
                                                render={(props) => <Settings {...props} logout={handleLogout} />}
                                            />
                                            {/* <Route component={NotFound} /> */}
                                        </Switch>
                                    </div>
                                    <Footer />
                                </div>
                            </div>
                        )}
                    </Switch>
                </Router>
            </SearchProvider>
        </LanguageProvider>
    );
};

export default App;
