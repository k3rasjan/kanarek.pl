import { BrowserRouter, Routes, Route } from "react-router-dom";
import '../components/Map.tsx'
import Login from '../pages/Login.tsx'
import  Register from '../pages/Register.tsx'
import App from '../App.tsx'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<App/>}/>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
      </Routes>
    </BrowserRouter>
  )
}
export default AppRouter
