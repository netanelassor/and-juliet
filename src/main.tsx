import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/book.css';
import './styles/premium-design.css';
import './styles/live-musical.css';
import './styles/cinematic-reader.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
