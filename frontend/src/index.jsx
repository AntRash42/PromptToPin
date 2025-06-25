import React from "react"; 
import ReactDOM from "react-dom/client"; 
import MapComponent from "./MapComponent";
import { AuthProvider } from "./AuthContext.jsx";
import LoginPage from './LoginPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render( 
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MapComponent />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<LoginPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);
