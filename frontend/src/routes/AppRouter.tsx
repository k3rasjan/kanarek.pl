import { BrowserRouter, Routes, Route } from "react-router-dom";
import '../components/Map/Map.tsx'
import Login from '../pages/Login/Login.tsx'
import  Register from '../pages/Register/Register.tsx'
import Home from '../pages/Home/Home.tsx'
import ForgotPasswordForm from "../pages/ForgotPassword/ForgotPasswordForm.tsx";
import Report from '../pages/Report/Report'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/przywroc-haslo" element={<ForgotPasswordForm/>} />
          <Route path='/zglos-kanara' element={<Report/>} />
      </Routes>
    </BrowserRouter>
  )
}
export default AppRouter
