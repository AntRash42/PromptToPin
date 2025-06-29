import React from "react"; 
import ReactDOM from "react-dom/client"; 
import MainView from "./MainView.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import LoginPage from './LoginPage';
import ProfilePage from './ProfilePage';
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render( 
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainView />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<LoginPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);
