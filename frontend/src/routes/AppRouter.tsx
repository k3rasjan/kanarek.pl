import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Home from "../pages/Home/Home";
import ForgotPasswordForm from "../pages/ForgotPassword/ForgotPasswordForm";
import MapPage from "../pages/MapPage/MapPage";
import MyAccountPage from "../pages/MyAccount/MyAccountPage.tsx";
import ReportPage from '../pages/ReportPage/ReportPage';

function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/przywroc-haslo" element={<ForgotPasswordForm />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/moje-konto" element={<MyAccountPage/>} />
            <Route path="/zgloszenie" element={<ReportPage />} />
        </Routes>
    );
}

export default AppRouter;
