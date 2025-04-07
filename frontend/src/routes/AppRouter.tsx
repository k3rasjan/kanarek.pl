import { BrowserRouter, Routes, Route } from "react-router-dom";
import '../components/Map/Map.tsx'
import Login from '../pages/Login/Login.tsx'
import  Register from '../pages/Register/Register.tsx'
import Home from '../pages/Home/Home.tsx'
import ForgotPasswordForm from "../pages/ForgotPassword/ForgotPasswordForm.tsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/przywroc-haslo" element={<ForgotPasswordForm/>} />
      </Routes>
    </BrowserRouter>
  )
}
export default AppRouter
