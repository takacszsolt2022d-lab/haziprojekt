import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar, Footer } from "./components/Layout";
import { ProtectedRoute, PublicRoute } from "./components/RouteGuards";
import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login";
import Profile from "./pages/profil";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <main style={{ padding: "1rem", minHeight: "70vh" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />

                        {/* Csak kijelentkezve */}
                        <Route element={<PublicRoute />}>
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                        </Route>

                        {/* Csak bejelentkezve */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/profile" element={<Profile />} />
                        </Route>
                    </Routes>
                </main>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;
