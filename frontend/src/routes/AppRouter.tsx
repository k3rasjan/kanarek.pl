import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Home from "../pages/Home/Home";
import ForgotPasswordForm from "../pages/ForgotPassword/ForgotPasswordForm";
import MapPage from "../pages/MapPage/MapPage";

function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/przywroc-haslo" element={<ForgotPasswordForm />} />
            <Route path="/mapa" element={<MapPage />} />
        </Routes>
    );
}

export default AppRouter;
