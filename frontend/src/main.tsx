import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import "./styles/input.css";

import './styles/global.css';
import AppRouter from './routes/AppRouter';

const root = document.getElementById('root')!;
createRoot(root).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppRouter />
        </BrowserRouter>
    </React.StrictMode>
);
