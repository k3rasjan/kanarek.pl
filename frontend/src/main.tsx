import { createRoot } from 'react-dom/client'
import './styles/global.css';
import AppRouter from './routes/AppRouter.tsx'

createRoot(document.getElementById('root')!).render(
    <AppRouter />
)
