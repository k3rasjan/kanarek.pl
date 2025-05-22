
import { createRoot } from "react-dom/client";
import "./styles/input.css";
import App from "./App.tsx";
// import Login from "./Login.tsx";

import './styles/global.css';
import AppRouter from './routes/AppRouter.tsx'

createRoot(document.getElementById('root')!).render(
    <AppRouter />
)
